import React from 'react';

/**
 * The top of a MacBook display: a thin bezel, a lit screen, and a menu bar.
 *
 * The menu bar is deliberately abstract. The brand asset rules forbid captures
 * containing real session content, and imitating another vendor's menu bar
 * would be a trademark problem, so it is suggested with neutral shapes at
 * believable proportions.
 */
export const Display: React.FC<{
  /** y of the outer bezel's top edge within the composition. */
  top: number;
  /** Total bezel width; may exceed the composition so the lid bleeds. */
  width: number;
  height: number;
  bezel: number;
  menuBarHeight: number;
  /** Screen-relative y at which the display fades into the page background. */
  fadeStart: number;
  fadeEnd: number;
  compositionWidth: number;
  /**
   * Horizontal padding for the menu bar. The lid bleeds past the composition,
   * so this must clear the overhang or items get sliced at the frame edge and
   * read as a rendering fault rather than a crop.
   */
  menuInset: number;
}> = ({
  top,
  width,
  height,
  bezel,
  menuBarHeight,
  fadeStart,
  fadeEnd,
  compositionWidth,
  menuInset,
}) => {
  const leftItems = [38, 48, 42, 46, 40];
  const rightItems = [17, 17, 21];
  const mask = `linear-gradient(to bottom, #000 0px, #000 ${fadeStart}px, transparent ${fadeEnd}px)`;

  return (
    <div
      style={{
        position: 'absolute',
        left: (compositionWidth - width) / 2,
        top,
        width,
        height,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        background: '#050506',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: bezel,
          right: bezel,
          top: bezel,
          bottom: 0,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          background: '#15171B',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: menuBarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: menuInset,
            paddingRight: menuInset,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 21}}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                background: 'rgba(242,237,222,0.34)',
              }}
            />
            {leftItems.map((itemWidth, index) => (
              <div
                key={index}
                style={{
                  width: itemWidth,
                  height: 9,
                  borderRadius: 4.5,
                  background: `rgba(242,237,222,${index === 0 ? 0.3 : 0.19})`,
                }}
              />
            ))}
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 19}}>
            {rightItems.map((itemWidth, index) => (
              <div
                key={index}
                style={{
                  width: itemWidth,
                  height: 9,
                  borderRadius: 4.5,
                  background: 'rgba(242,237,222,0.19)',
                }}
              />
            ))}
            <div
              style={{
                width: 62,
                height: 9,
                borderRadius: 4.5,
                background: 'rgba(242,237,222,0.25)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
