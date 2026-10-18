import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';

export function FaviconLogo({ size = 130 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      {/* Cyan back card */}
      <Path
        d="M105 88 H386 Q488 88 488 190 V377 Q488 484 383 484 H180 Q99 484 99 403 Z"
        fill="#08C7F2"
        stroke="#111111"
        strokeWidth={24}
        strokeLinejoin="round"
      />

      {/* Yellow front card */}
      <Rect
        x={16}
        y={12}
        width={422}
        height={422}
        rx={88}
        fill="#FFD21C"
        stroke="#111111"
        strokeWidth={24}
      />

      {/* Letter S */}
      <SvgText
        x={227}
        y={304}
        textAnchor="middle"
        fontFamily="System"
        fontSize={238}
        fontWeight="bold"
        fill="#111111"
      >
        S
      </SvgText>
    </Svg>
  );
}
