import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
        <View style={styles.container}>
          <View style={styles.content}>
            <Animated.View 
              style={[
                styles.iconContainer,
                { transform: [{ scale: this.pulseAnim }] }
              ]}
            >
              <AlertTriangle size={48} color="#E11D48" />
            </Animated.View>
            
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.subtitle}>Something went wrong</Text>
            
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={this.handleReset}
                activeOpacity={0.8}
              >
                <RefreshCw size={18} color="#FFF" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.hint}>
            If this keeps happening, try restarting the app
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#78716C',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#A8A29E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E11D48',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    color: '#A8A29E',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
