import XyneIslandCore
import SwiftUI

struct NotchRootView: View {
    @ObservedObject var store: IslandStore
    let hasHardwareNotch: Bool
    let hardwareNotchWidth: CGFloat
    let collapsedBarHeight: CGFloat
    let captureMode: Bool
    let onExpansionChange: (Bool) -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ObservedObject private var expansionState: NotchExpansionState
    @State private var collapseTask: Task<Void, Never>?
    @State private var isHovering = false

    init(
        store: IslandStore,
        hasHardwareNotch: Bool,
        hardwareNotchWidth: CGFloat = 0,
        collapsedBarHeight: CGFloat = 40,
        initiallyExpanded: Bool,
        captureMode: Bool = false,
        expansionState: NotchExpansionState? = nil,
        onExpansionChange: @escaping (Bool) -> Void
    ) {
        self.store = store
        self.hasHardwareNotch = hasHardwareNotch
        self.hardwareNotchWidth = hardwareNotchWidth
        self.collapsedBarHeight = collapsedBarHeight
        self.captureMode = captureMode
        self.onExpansionChange = onExpansionChange
        _expansionState = ObservedObject(
            wrappedValue: expansionState ?? NotchExpansionState(isExpanded: initiallyExpanded)
        )
    }

    var body: some View {
        Group {
            if isExpanded {
                expandedContent
            } else {
                collapsedContent
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background {
            NotchSurfaceShape(
                topRadius: hasHardwareNotch ? 0 : (isExpanded ? 22 : 16),
                bottomRadius: isExpanded ? 26 : 14
            )
            .fill(.black)
            .shadow(color: surfaceShadowColor, radius: 18, y: 7)
        }
        .contentShape(Rectangle())
        .onHover(perform: handleHover)
        .onTapGesture {
            if !isExpanded { setExpanded(true) }
        }
        .onChange(of: store.attentionCount) { _, count in
            if count > 0 { setExpanded(true) }
        }
        .onChange(of: store.latestReveal?.id) { _, revealID in
            guard revealID != nil else { return }
            presentReveal()
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("\(IslandBrand.name), everything from Spaces that needs you")
    }

    private var isExpanded: Bool {
        expansionState.isExpanded
    }

    @ViewBuilder
    private var collapsedContent: some View {
        if store.cards.isEmpty {
            if hasHardwareNotch {
                Color.clear
                    .accessibilityHidden(true)
            } else {
                ThinkingStatusOrb(state: .fyi, size: 16)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        } else if hasHardwareNotch, hardwareNotchWidth > 0 {
            HStack(spacing: 0) {
                collapsedStatus
                    .padding(.leading, 16)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Color.clear
                    .frame(width: hardwareNotchWidth, height: collapsedBarHeight)
                    .accessibilityHidden(true)

                castRow
                    .padding(.trailing, 16)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
            .frame(height: collapsedBarHeight)
            .transition(collapsedTransition)
        } else {
            HStack(spacing: 10) {
                collapsedStatus
                Spacer(minLength: 5)
                castRow
            }
            .padding(.horizontal, 16)
            .frame(height: 40)
            .transition(collapsedTransition)
        }
    }

    private var collapsedStatus: some View {
        HStack(spacing: 10) {
            statusBeacon
            Text(collapsedTitle)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.92))
                .lineLimit(1)
        }
    }

    private var expandedContent: some View {
        VStack(spacing: 0) {
            header
            Rectangle()
                .fill(.white.opacity(0.075))
                .frame(height: 1)

            if store.visibleCards.isEmpty {
                QuietIslandView(bridge: store.bridge)
                    .frame(maxHeight: .infinity)
            } else {
                if captureMode {
                    cardList
                        .frame(maxHeight: .infinity, alignment: .top)
                } else {
                    ScrollView(.vertical, showsIndicators: false) {
                        cardList
                    }
                }
            }
        }
        .frame(
            width: NotchLayout.expandedSize.width,
            height: NotchLayout.expandedSize.height,
            alignment: .top
        )
        .transition(.asymmetric(
            insertion: .opacity
                .combined(with: .offset(y: -4))
                .combined(with: .scale(scale: 0.99, anchor: .top)),
            removal: .opacity.combined(with: .offset(y: -3))
        ))
    }

    private var collapsedTransition: AnyTransition {
        .asymmetric(
            insertion: .opacity,
            removal: .opacity.combined(with: .scale(scale: 0.98, anchor: .top))
        )
    }

    private var cardList: some View {
        VStack(spacing: 8) {
            ForEach(store.visibleCards) { card in
                CardView(
                    card: card,
                    reveal: store.reveal(for: card),
                    isFeatured: store.isFeatured(card),
                    open: { store.open(card); OpenInSpaces.open(card) },
                    markHandled: { store.dismissPrompt(card) },
                    jump: { OpenInSpaces.open(card) },
                    dismiss: { store.dismiss(card) }
                )
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }

    private var header: some View {
        HStack(spacing: 10) {
            IslandMark()

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 6) {
                    Text(IslandBrand.wordmark)
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .tracking(0.7)
                        .foregroundStyle(.white.opacity(0.92))
                    if store.isPreview {
                        Text("PREVIEW")
                            .font(.system(size: 8, weight: .bold, design: .monospaced))
                            .foregroundStyle(.black)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(.white.opacity(0.8), in: Capsule())
                    }
                }
                Text(headerSubtitle)
                    .font(.system(size: 10, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.42))
            }

            Spacer()

            if store.attentionCount > 0 {
                Text("\(store.attentionCount) NEEDS YOU")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundStyle(Color.notchAmber)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(Color.notchAmber.opacity(0.11), in: Capsule())
            }

            if store.finishedCount > 0 {
                Button(action: store.clearFinished) {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 10, weight: .semibold))
                        .frame(width: 28, height: 28)
                        .foregroundStyle(.white.opacity(0.42))
                        .background(.white.opacity(0.05), in: Circle())
                        .contentShape(Rectangle())
                }
                .buttonStyle(NotchPressButtonStyle())
                .frame(width: 40, height: 40)
                .accessibilityLabel("Clear finished cards")
            }

            Button {
                setExpanded(false)
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 10, weight: .semibold))
                    .frame(width: 28, height: 28)
                    .foregroundStyle(.white.opacity(0.5))
                    .background(.white.opacity(0.06), in: Circle())
                    .contentShape(Rectangle())
            }
            .buttonStyle(NotchPressButtonStyle())
            .frame(width: 40, height: 40)
            .accessibilityLabel("Collapse \(IslandBrand.name)")
        }
        .padding(.leading, 14)
        .padding(.trailing, 8)
        .frame(height: 54)
    }

    private var statusBeacon: some View {
        ThinkingStatusOrb(state: overallState, size: 18)
    }

    private var castRow: some View {
        let present = CastID.allCases.filter { cast in store.cards.contains { $0.id.cast == cast } }
        return HStack(spacing: 5) {
            ForEach(Array(present.enumerated()), id: \.element) { index, cast in
                CastAvatarView(
                    cast: cast,
                    state: castState(cast),
                    size: 17,
                    showsContainer: false,
                    animates: false,
                    phaseOffset: 0.8 + Double(index) * 1.5
                )
            }
        }
    }

    private func castState(_ cast: CastID) -> CardState {
        let cards = store.cards.filter { $0.id.cast == cast }
        if cards.contains(where: { $0.state.needsAttention }) { return .approval }
        if cards.contains(where: { $0.state == .working }) { return .working }
        if cards.contains(where: { $0.state == .overdue }) { return .overdue }
        if cards.contains(where: { $0.state == .done }) { return .done }
        return .fyi
    }

    private var collapsedTitle: String {
        if store.attentionCount > 0 { return "\(store.attentionCount) needs you" }
        if let working = store.visibleCards.first(where: { $0.state == .working }) {
            return working.activity
        }
        return "\(store.cards.count) live"
    }

    private var overallState: CardState {
        if store.cards.contains(where: { $0.state.needsAttention }) { return .approval }
        if store.cards.contains(where: { $0.state == .working }) { return .working }
        if store.cards.contains(where: { $0.state == .overdue }) { return .overdue }
        if store.cards.contains(where: { $0.state == .done }) { return .done }
        return .fyi
    }

    private var headerSubtitle: String {
        guard !store.cards.isEmpty else { return IslandBrand.tagline.uppercased() }
        let working = store.cards.filter { $0.state == .working }.count
        return "\(store.cards.count) LIVE · \(working) IN MOTION"
    }

    private var surfaceShadowColor: Color {
        if hasHardwareNotch, store.cards.isEmpty, !isExpanded { return .clear }
        return .black.opacity(hasHardwareNotch ? 0.18 : 0.34)
    }

    private func motion(expanding: Bool) -> Animation? {
        reduceMotion ? nil : NotchMotion.animation(expanding: expanding)
    }

    private func handleHover(_ inside: Bool) {
        guard !captureMode else { return }
        isHovering = inside
        collapseTask?.cancel()
        if inside {
            setExpanded(true)
        } else {
            collapseTask = Task {
                try? await Task.sleep(for: .milliseconds(260))
                guard !Task.isCancelled else { return }
                await MainActor.run { setExpanded(false) }
            }
        }
    }

    private func presentReveal() {
        collapseTask?.cancel()
        setExpanded(true)
        guard !captureMode else { return }
        collapseTask = Task {
            try? await Task.sleep(for: .seconds(8))
            guard !Task.isCancelled else { return }
            await MainActor.run {
                guard !isHovering, store.attentionCount == 0 else { return }
                setExpanded(false)
            }
        }
    }

    private func setExpanded(_ value: Bool) {
        guard value != isExpanded else { return }
        onExpansionChange(value)
        withAnimation(motion(expanding: value)) {
            expansionState.isExpanded = value
        }
    }
}

private struct NotchSurfaceShape: Shape {
    var topRadius: CGFloat
    var bottomRadius: CGFloat

    var animatableData: AnimatablePair<CGFloat, CGFloat> {
        get { AnimatablePair(topRadius, bottomRadius) }
        set {
            topRadius = newValue.first
            bottomRadius = newValue.second
        }
    }

    func path(in rect: CGRect) -> Path {
        let top = min(topRadius, rect.width / 2, rect.height / 2)
        let bottom = min(bottomRadius, rect.width / 2, rect.height / 2)
        var path = Path()
        path.move(to: CGPoint(x: rect.minX + top, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - top, y: rect.minY))
        path.addQuadCurve(
            to: CGPoint(x: rect.maxX, y: rect.minY + top),
            control: CGPoint(x: rect.maxX, y: rect.minY)
        )
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - bottom))
        path.addQuadCurve(
            to: CGPoint(x: rect.maxX - bottom, y: rect.maxY),
            control: CGPoint(x: rect.maxX, y: rect.maxY)
        )
        path.addLine(to: CGPoint(x: rect.minX + bottom, y: rect.maxY))
        path.addQuadCurve(
            to: CGPoint(x: rect.minX, y: rect.maxY - bottom),
            control: CGPoint(x: rect.minX, y: rect.maxY)
        )
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + top))
        path.addQuadCurve(
            to: CGPoint(x: rect.minX + top, y: rect.minY),
            control: CGPoint(x: rect.minX, y: rect.minY)
        )
        path.closeSubpath()
        return path
    }
}
