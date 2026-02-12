import { useState, useEffect, useCallback } from 'react';

const PAYMENT_API_URL = 'https://functions.poehali.dev/904921a5-febc-4136-9455-b12df8b051ea';

interface SubscriptionData {
  plan_type: string;
  ai_analysis_enabled: boolean;
  ai_suggestions_enabled: boolean;
  max_clients: number;
  max_calls_per_month: number;
  max_email_campaigns: number;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    try {
      const authData = localStorage.getItem('avt_auth');
      if (!authData) {
        setLoading(false);
        return;
      }

      const { user_id } = JSON.parse(authData);

      const response = await fetch(`${PAYMENT_API_URL}?path=subscription&user_id=${user_id}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const checkFeatureAccess = useCallback(async (feature: string): Promise<boolean> => {
    try {
      const authData = localStorage.getItem('avt_auth');
      if (!authData) return false;

      const { user_id } = JSON.parse(authData);

      const response = await fetch(`${PAYMENT_API_URL}?path=check_access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, feature })
      });

      if (response.ok) {
        const data = await response.json();
        return data.access;
      }

      return false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }, []);

  const hasFeature = (feature: 'ai_analysis' | 'ai_suggestions'): boolean => {
    if (!subscription) return false;
    
    if (feature === 'ai_analysis') {
      return subscription.ai_analysis_enabled;
    }
    if (feature === 'ai_suggestions') {
      return subscription.ai_suggestions_enabled;
    }
    
    return false;
  };

  return {
    subscription,
    loading,
    hasFeature,
    checkFeatureAccess,
    reload: loadSubscription
  };
};
