import React, { Component, ReactNode } from 'react';
import { Animated } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private pulseAnim = new Animated.Value(1);

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('[ErrorBoundary] Caught error:', error);
    console.log('[ErrorBoundary] Error info:', errorInfo.componentStack);
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      this.startPulseAnimation();
    }
  }

  startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(this.pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <YStack
          flex={1}
          backgroundColor="#FFFBFA"
          justifyContent="center"
          alignItems="center"
          padding={24}
        >
          <YStack alignItems="center" maxWidth={320}>
            <Animated.View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: '#FEE2E2',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                transform: [{ scale: this.pulseAnim }],
              }}
            >
              <AlertTriangle size={48} color="#E11D48" />
            </Animated.View>

            <Text
              fontSize={32}
              fontWeight="800"
              color="#1C1917"
              marginBottom={8}
              letterSpacing={-0.5}
            >
              Oops!
            </Text>
            <Text fontSize={18} fontWeight="500" color="#78716C" marginBottom={16}>
              Something went wrong
            </Text>

            <Text
              fontSize={14}
              color="#A8A29E"
              textAlign="center"
              lineHeight={20}
              marginBottom={32}
              paddingHorizontal={16}
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>

            <XStack>
              <XStack
                alignItems="center"
                justifyContent="center"
                backgroundColor="#E11D48"
                paddingHorizontal={24}
                paddingVertical={14}
                borderRadius={16}
                shadowColor="#E11D48"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.3}
                shadowRadius={8}
                elevation={4}
                pressStyle={{ opacity: 0.8 }}
                onPress={this.handleReset}
              >
                <YStack marginRight={8}>
                  <RefreshCw size={18} color="#FFF" />
                </YStack>
                <Text color="#FFFFFF" fontSize={16} fontWeight="600">
                  Try Again
                </Text>
              </XStack>
            </XStack>
          </YStack>

          <Text
            position="absolute"
            bottom={48}
            fontSize={12}
            color="#A8A29E"
            textAlign="center"
          >
            If this keeps happening, try restarting the app
          </Text>
        </YStack>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
