// widgets/MatchActivity.tsx
import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

export type MatchActivityProps = {
  team1: string;
  team2: string;
  team1Score: number;
  team2Score: number;
  round: number;
  totalRounds: number;
  status: string;
  map: string;
};

const MatchActivity = (
  props: MatchActivityProps,
  environment: LiveActivityEnvironment
) => {
  'widget';
  const accentColor = environment.colorScheme === 'dark' ? '#FFFFFF' : '#F97316';

  return {
    banner: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <HStack>
          <Text modifiers={[font({ weight: 'bold' })]}>{props.team1}</Text>
          <Text modifiers={[font({ weight: 'bold' }), foregroundStyle(accentColor)]}>
            {props.team1Score} - {props.team2Score}
          </Text>
          <Text modifiers={[font({ weight: 'bold' })]}>{props.team2}</Text>
        </HStack>
        <Text modifiers={[font({ size: 12 })]}>
          {props.map} · Round {props.round}/{props.totalRounds} · {props.status}
        </Text>
      </VStack>
    ),
    compactLeading: <Text modifiers={[foregroundStyle(accentColor)]}>{props.team1Score}</Text>,
    compactTrailing: <Text modifiers={[foregroundStyle(accentColor)]}>{props.team2Score}</Text>,
    minimal: <Text modifiers={[foregroundStyle(accentColor)]}>{props.team1Score}</Text>,
    expandedLeading: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 12 })]}>{props.team1}</Text>
        <Text modifiers={[font({ weight: 'bold', size: 20 })]}>{props.team1Score}</Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 12 })]}>{props.team2}</Text>
        <Text modifiers={[font({ weight: 'bold', size: 20 })]}>{props.team2Score}</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 12 })]}>
          {props.map} · Round {props.round}/{props.totalRounds}
        </Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('MatchActivity', MatchActivity);
