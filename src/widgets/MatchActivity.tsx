// widgets/MatchActivity.tsx
import {
  HStack,
  Image,
  Rectangle,
  Text,
  VStack,
  ZStack,
  Spacer,
} from "@expo/ui/swift-ui";
import {
  clipped,
  font,
  foregroundStyle,
  padding,
  frame,
  resizable,
  aspectRatio,
  shadow,
} from "@expo/ui/swift-ui/modifiers";
import { createLiveActivity, type LiveActivityEnvironment } from "expo-widgets";

export type MatchActivityProps = {
  league: string;
  team1: string;
  team2: string;
  team1Score: number;
  team2Score: number;
  bestOf: number | undefined;
  team1LogoPath?: string;
  team2LogoPath?: string;
  team1Color: string;
  team2Color: string;
  mapLabel: string;
  roundScoreA: number;
  roundScoreB: number;
  matchTypeLabel: string;
  detailLine?: string;
  status: string;
};

const MatchActivity = (
  props: MatchActivityProps,
  environment: LiveActivityEnvironment,
) => {
  "widget";

  const renderTeamBlock = (
    name: string,
    score: number,
    logoPath: string | undefined,
    color: string,
    align: "leading" | "trailing",
  ) => {
    // Uses the cached team logo so that the local widget can render. It cannot make http calls.
    // Could use the expo push notif sometime to save caching? Not sure how important that would be however.
    const logo = logoPath ? (
      <Image
        uiImage={logoPath}
        modifiers={[
          resizable(),
          aspectRatio({ contentMode: "fit" }),
          frame({ width: 32, height: 32 }),
          shadow({ color: `${color}`, radius: 12 }),
        ]}
      />
    ) : (
      <VStack
        modifiers={[frame({ width: 32, height: 32 }), padding({ all: 0 })]}
      >
        <Text
          modifiers={[
            font({ weight: "bold", size: 13 }),
            foregroundStyle("white"),
          ]}
        >
          {name.slice(0, 2).toUpperCase()}
        </Text>
      </VStack>
    );

    const scoreText = (
      <Text
        modifiers={[
          font({ size: 40, weight: "regular" }),
          foregroundStyle("white"),
        ]}
      >
        {score}
      </Text>
    );

    return (
      <VStack
        spacing={4}
        alignment={align === "leading" ? "leading" : "trailing"}
      >
        {align === "leading" ? (
          <HStack spacing={10}>
            {logo}
            {scoreText}
          </HStack>
        ) : (
          <HStack spacing={10}>
            {scoreText}
            {logo}
          </HStack>
        )}
        <Text
          modifiers={[
            font({ size: 12, weight: "semibold" }),
            foregroundStyle({ type: "hierarchical", style: "secondary" }),
          ]}
        >
          {name}
        </Text>
      </VStack>
    );
  };

  return {
    banner: (
      <ZStack modifiers={[clipped()]}>
        <Rectangle
          modifiers={[
            frame({ maxWidth: Infinity, maxHeight: Infinity }),
            foregroundStyle("#161210"),
          ]}
        />

        <VStack spacing={10} modifiers={[padding({ all: 14 })]}>
          <HStack modifiers={[padding({ horizontal: 4 })]}>
            {renderTeamBlock(
              props.team1,
              props.team1Score,
              props.team1LogoPath,
              props.team1Color,
              "leading",
            )}
            <Spacer />
            <VStack spacing={2}>
              {props.bestOf ? (
                <Text
                  modifiers={[
                    font({ size: 12, weight: "semibold" }),
                    foregroundStyle({
                      type: "hierarchical",
                      style: "secondary",
                    }),
                  ]}
                >
                  Best of {props.bestOf}
                </Text>
              ) : (
                <></>
              )}
              <Text
                modifiers={[
                  font({ weight: "bold", size: 16 }),
                  foregroundStyle("white"),
                ]}
              >
                {props.mapLabel}
              </Text>
              {props.status === "Running" ? (
                <Text
                  modifiers={[
                    font({ size: 12, weight: "semibold" }),
                    foregroundStyle({
                      type: "hierarchical",
                      style: "secondary",
                    }),
                  ]}
                >
                  {props.roundScoreA} - {props.roundScoreB}
                </Text>
              ) : (
                <Text
                  modifiers={[
                    font({
                      size: 12,
                      weight: "semibold",
                    }),
                    foregroundStyle({
                      type: "hierarchical",
                      style: "secondary",
                    }),
                  ]}
                >
                  {props.status}
                </Text>
              )}
            </VStack>
            <Spacer />
            {renderTeamBlock(
              props.team2,
              props.team2Score,
              props.team2LogoPath,
              props.team2Color,
              "trailing",
            )}
          </HStack>

          {props.detailLine ? (
            <HStack spacing={8} modifiers={[padding({ top: 4 })]}>
              <Text
                modifiers={[
                  font({ size: 13, weight: "medium" }),
                  foregroundStyle("white"),
                ]}
                lineLimit={2}
              >
                {props.detailLine}
              </Text>
            </HStack>
          ) : null}
        </VStack>
      </ZStack>
    ),
    compactLeading: (
      <Text modifiers={[foregroundStyle(props.team1Color)]}>
        {props.team1Score}
      </Text>
    ),
    compactTrailing: (
      <Text modifiers={[foregroundStyle(props.team2Color)]}>
        {props.team2Score}
      </Text>
    ),
    minimal: (
      <Text modifiers={[foregroundStyle(props.team1Color)]}>
        {props.team1Score}
      </Text>
    ),
    expandedLeading: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 12 })]}>{props.team1}</Text>
        <Text modifiers={[font({ weight: "bold", size: 20 })]}>
          {props.team1Score}
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 12 })]}>{props.team2}</Text>
        <Text modifiers={[font({ weight: "bold", size: 20 })]}>
          {props.team2Score}
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 12 })]}>
          {props.detailLine ?? props.mapLabel}
        </Text>
      </VStack>
    ),
  };
};

export default createLiveActivity("MatchActivity", MatchActivity);
