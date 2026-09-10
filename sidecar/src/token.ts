/**
 * Spaces credentials, kept fresh without anyone having to think about it.
 *
 * The `spaces` CLI is the only thing that can turn a browser session into an
 * API token, so this module drives it rather than reimplementing it:
 *
 *   spaces token            fetch one if the stored token is missing or nearly
 *                           expired; a no-op when it is still good
 *   spaces token --update   force a new one, whatever is on disk
 *
 * Tokens live in `~/.config/xyne-island/env`, outside any checkout, because the
 * CLI writes a bearer credential for the user's whole identity and refuses to
 * put one in a git-tracked file.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { AuthError } from '@xyne/spaces-sdk';

const run = promisify(execFile);

/** Refresh this far ahead of expiry rather than handing the SDK a dying token. */
const REFRESH_MARGIN_MS = 5 * 60_000;
/** A forced refresh reads the browser's cookie jar; never do that in a tight loop. */
const MIN_FORCED_REFRESH_INTERVAL_MS = 60_000;

export const DEFAULT_BASE_URL = 'https://spaces.xyne.juspay.net';

/** Exit code the app reads as "this needs a person, restarting will not help". */
export const EXIT_NEEDS_SIGN_IN = 78;

export interface Credentials {
  token: string;
  baseUrl: string;
  /** Epoch ms, or null when the token carries no expiry we can read. */
  expiresAt: number | null;
  source: 'environment' | 'cli';
}

export class NeedsSignIn extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NeedsSignIn';
  }
}

/** Where the credential file lives; the app agrees on this path. */
export function credentialsPath(): string {
  const override = process.env.XYNE_ISLAND_ENV;
  if (override) return path.resolve(override);
  return path.join(os.homedir(), '.config', 'xyne-island', 'env');
}

/** Epoch ms the JWT expires, or null when it does not say. */
export function expiryOf(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Read one key out of a .env, tolerating `export ` and quotes. */
function readEnvValue(file: string, key: string): string | undefined {
  if (!fs.existsSync(file)) return undefined;
  const pattern = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=\\s*(.*)$`);
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line.trimStart().startsWith('#')) continue;
    const match = pattern.exec(line);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return undefined;
}

export class TokenStore {
  private readonly file: string;
  private cached: Credentials | null = null;
  private lastForcedRefresh = 0;
  private inFlight: Promise<Credentials> | null = null;

  constructor(file: string = credentialsPath()) {
    this.file = file;
  }

  get path(): string {
    return this.file;
  }

  /**
   * Credentials good for at least the next few minutes, fetching a token if the
   * stored one is missing or nearly out of time.
   */
  async current(): Promise<Credentials> {
    const fromEnvironment = this.fromProcessEnvironment();
    if (fromEnvironment) return fromEnvironment;

    if (this.cached && !this.isExpiring(this.cached)) return this.cached;

    const stored = this.read();
    if (stored && !this.isExpiring(stored)) {
      this.cached = stored;
      return stored;
    }
    return this.fetch({ force: false });
  }

  /**
   * Throw away what we have and get a new token. Called when Spaces rejects the
   * current one, and when someone picks Refresh from the menu bar.
   *
   * `interactive` lets the CLI open the sign-in page: right when a person just
   * asked for it, wrong for a background refresh nobody is watching.
   */
  async refresh({ interactive = false } = {}): Promise<Credentials> {
    const since = Date.now() - this.lastForcedRefresh;
    if (since < MIN_FORCED_REFRESH_INTERVAL_MS && this.cached) {
      // A rejected token that a fresh one did not fix is not a token problem.
      // Backing off here keeps a failing API from spawning browser prompts.
      return this.cached;
    }
    return this.fetch({ force: true, interactive });
  }

  private fromProcessEnvironment(): Credentials | null {
    const token = process.env.XYNE_TOKEN;
    if (!token) return null;
    return {
      token,
      baseUrl: (process.env.XYNE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
      expiresAt: expiryOf(token),
      source: 'environment',
    };
  }

  private read(): Credentials | null {
    const token = readEnvValue(this.file, 'XYNE_TOKEN');
    if (!token) return null;
    return {
      token,
      baseUrl: (readEnvValue(this.file, 'XYNE_BASE_URL') || process.env.XYNE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
      expiresAt: expiryOf(token),
      source: 'cli',
    };
  }

  private isExpiring(credentials: Credentials): boolean {
    if (credentials.expiresAt === null) return false;
    return credentials.expiresAt - REFRESH_MARGIN_MS <= Date.now();
  }

  /** One `spaces token` run at a time, however many callers ask at once. */
  private fetch(options: { force: boolean; interactive?: boolean }): Promise<Credentials> {
    this.inFlight ??= this.runCLI(options).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async runCLI({ force, interactive = false }: { force: boolean; interactive?: boolean }): Promise<Credentials> {
    fs.mkdirSync(path.dirname(this.file), { recursive: true, mode: 0o700 });
    if (force) this.lastForcedRefresh = Date.now();

    const args = ['token', '--env', this.file];
    if (force) args.push('--update');

    try {
      await run('spaces', args, {
        timeout: 90_000,
        env: {
          ...process.env,
          // A background refresh must not throw a browser tab at someone
          // mid-sentence; an explicit Refresh should take them to the sign-in page.
          ...(interactive ? {} : { XYNE_NO_OPEN: '1' }),
        },
      });
    } catch (error) {
      throw this.explain(error);
    }

    const credentials = this.read();
    if (!credentials) {
      throw new NeedsSignIn(`\`spaces token\` reported success but wrote no token to ${this.file}.`);
    }
    this.cached = credentials;
    return credentials;
  }

  /** Turn a CLI failure into something worth putting in front of a person. */
  private explain(error: unknown): Error {
    const failure = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string };
    if (failure.code === 'ENOENT') {
      return new NeedsSignIn(
        'The Spaces CLI is not installed. Install it with `npm install -g @xyne/spaces-cli`, then try again.',
      );
    }
    const output = `${failure.stderr ?? ''}\n${failure.stdout ?? ''}`
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const detail = output[output.length - 1] ?? failure.message;
    return new NeedsSignIn(detail);
  }
}

/**
 * Whether a failure from the SDK means "this token is no good".
 *
 * The SDK raises a named `AuthError` for 401/403; the string check is there for
 * failures that surface before the SDK can classify them.
 */
export function isAuthFailure(error: unknown): boolean {
  if (error instanceof AuthError) return true;
  const status = (error as { status?: number; statusCode?: number })?.status
    ?? (error as { statusCode?: number })?.statusCode;
  if (status === 401 || status === 403) return true;
  return /\b(401|403|unauthori[sz]ed|forbidden|invalid token|token expired)\b/i.test(
    (error as Error)?.message ?? '',
  );
}
