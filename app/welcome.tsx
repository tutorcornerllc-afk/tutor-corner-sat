import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { markWelcomeSeen, sendOnboardingData } from './storage';

export default function WelcomeScreen() {
  const router = useRouter();
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [agreedAge, setAgreedAge]         = useState(false);
  const [agreedTerms, setAgreedTerms]     = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedRefund, setAgreedRefund]   = useState(false);
  const [agreedLiability, setAgreedLiability] = useState(false);
  const [agreedSat, setAgreedSat]         = useState(false);
  const [marketing, setMarketing]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  const canProceed = agreedAge && agreedTerms && agreedPrivacy
    && agreedRefund && agreedLiability && agreedSat;

  async function handleSubmit() {
    if (!canProceed) {
      setError('Please check all required boxes to continue.');
      return;
    }
    setLoading(true);
    await sendOnboardingData({
      name, email, phone,
      agreedAge, agreedTerms, agreedPrivacy,
      agreedRefund, agreedLiability, agreedSat,
      marketing, skipped: false,
    });
    await markWelcomeSeen();
    setLoading(false);
    router.replace('/(tabs)');
  }

  async function handleSkip() {
    setLoading(true);
    await sendOnboardingData({
      name: '', email: '', phone: '',
      agreedAge: false, agreedTerms: false,
      agreedPrivacy: false, agreedRefund: false,
      agreedLiability: false, agreedSat: false,
      marketing: false, skipped: true,
    });
    await markWelcomeSeen();
    setLoading(false);
    router.replace('/(tabs)');
  }

  function Checkbox({ checked, onPress, label, link, linkUrl, required }: {
    checked: boolean;
    onPress: () => void;
    label: string;
    link?: string;
    linkUrl?: string;
    required?: boolean;
  }) {
    return (
      <TouchableOpacity
        style={styles.checkRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.checkLabelWrap}>
          <Text style={styles.checkLabel}>
            {label}
            {link && linkUrl ? (
              <Text
                style={styles.checkLink}
                onPress={() => Linking.openURL(linkUrl)}
              >{' '}{link}</Text>
            ) : null}
            {'  '}
            {required
              ? <Text style={styles.requiredBadge}>Required</Text>
              : <Text style={styles.optionalBadge}>Optional</Text>
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.inner}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎓</Text>
        <Text style={styles.title}>Tutor Corner LLC®</Text>
        <Text style={styles.subtitle}>SAT® Prep Games</Text>
        <Text style={styles.welcome}>
          Welcome! Save your progress so you never lose it.
        </Text>
      </View>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Enter your details below and we'll email you a backup code.
          Use it to restore your progress if you ever switch devices.
          This is optional — tap Skip to go straight to the app.
        </Text>
      </View>

      {/* Inputs */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Your name (optional)"
          placeholderTextColor="#6B7280"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email address (optional)"
          placeholderTextColor="#6B7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone number (optional)"
          placeholderTextColor="#6B7280"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Legal */}
      <View style={styles.legalSection}>
        <Text style={styles.legalTitle}>📋 Legal Agreements</Text>
        <Text style={styles.legalSub}>
          Please read our{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://tutorcornerllc.com/legal')}
          >
            Privacy Policy, Terms of Service, and all legal agreements
          </Text>
          {' '}before checking the boxes below.
          All required boxes must be checked to proceed.
        </Text>

        <Checkbox
          checked={agreedAge}
          onPress={() => setAgreedAge(!agreedAge)}
          label="I confirm I have read the"
          link="Terms of Service and Privacy Policy"
          linkUrl="https://tutorcornerllc.com/legal"
          required
        />
        <Text style={styles.subLabel}>and I am 13 years of age or older.</Text>

        <Checkbox
          checked={agreedTerms}
          onPress={() => setAgreedTerms(!agreedTerms)}
          label="I have read and agree to the"
          link="Terms of Service"
          linkUrl="https://tutorcornerllc.com/legal"
          required
        />
        <Text style={styles.subLabel}>of Tutor Corner LLC®.</Text>

        <Checkbox
          checked={agreedRefund}
          onPress={() => setAgreedRefund(!agreedRefund)}
          label="I have read and understand that all purchases are final. No refunds after payment confirmation per the"
          link="Tutor Corner LLC® Terms of Service."
          linkUrl="https://tutorcornerllc.com/legal"
          required
        />

        <Checkbox
          checked={agreedLiability}
          onPress={() => setAgreedLiability(!agreedLiability)}
          label="I have read and understand that Tutor Corner LLC® is not liable for technical issues, app modifications, or discontinuation. Lifetime purchase applies to the current app version only and does not include future separate apps."
          required
        />

        <Checkbox
          checked={agreedPrivacy}
          onPress={() => setAgreedPrivacy(!agreedPrivacy)}
          label="I have read the"
          link="Privacy Policy"
          linkUrl="https://tutorcornerllc.com/legal"
          required
        />
        <Text style={styles.subLabel}>
          and consent to Tutor Corner LLC® collecting and storing
          my contact information for account management.
        </Text>

        <Checkbox
          checked={agreedSat}
          onPress={() => setAgreedSat(!agreedSat)}
          label="I understand that SAT® is a registered trademark of College Board and that Tutor Corner LLC® is not affiliated with or endorsed by College Board."
          required
        />

        <Checkbox
          checked={marketing}
          onPress={() => setMarketing(!marketing)}
          label="I would like to receive SAT® prep tips and tutoring offers from Tutor Corner LLC® via email and/or phone."
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.submitBtn, !canProceed && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#FFFFFF" />
          : <Text style={styles.submitBtnText}>
              {email ? 'Save & Send My Backup Code 🚀' : 'Continue to App 🚀'}
            </Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        disabled={loading}
      >
        <Text style={styles.skipBtnText}>Skip for now</Text>
      </TouchableOpacity>

      <Text style={styles.legalFooter}>
        SAT® is a registered trademark of College Board.
        Tutor Corner LLC® is not affiliated with or endorsed by College Board.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  inner:     { paddingHorizontal: 24, paddingTop: 60 },

  header:   { alignItems: 'center', marginBottom: 24 },
  logo:     { fontSize: 56, marginBottom: 8 },
  title:    { fontSize: 24, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#2563EB', fontWeight: '600', marginTop: 4 },
  welcome:  { fontSize: 14, color: '#9CA3AF', marginTop: 12, textAlign: 'center', lineHeight: 20 },

  infoBox: {
    backgroundColor: '#1A1A2E', borderRadius: 14,
    padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: '#2563EB30',
  },
  infoText: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },

  inputSection: { marginBottom: 24, gap: 12 },
  input: {
    backgroundColor: '#1A1A2E', borderRadius: 12,
    padding: 14, color: '#FFFFFF',
    borderWidth: 1, borderColor: '#2D2D44', fontSize: 15,
  },

  legalSection: { marginBottom: 20 },
  legalTitle:   { fontSize: 17, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  legalSub:     { fontSize: 12, color: '#9CA3AF', lineHeight: 18, marginBottom: 16 },
  legalLink:    { color: '#2563EB', fontWeight: '600' },

  checkRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, marginBottom: 6,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: '#4B5563',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked:  { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkmark:        { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  checkLabelWrap:   { flex: 1 },
  checkLabel:       { fontSize: 13, color: '#D1D5DB', lineHeight: 20 },
  checkLink:        { color: '#2563EB', fontWeight: '600' },
  subLabel: {
    fontSize: 12, color: '#9CA3AF',
    marginLeft: 36, marginBottom: 14, lineHeight: 18,
  },

  requiredBadge: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
  optionalBadge: { color: '#10B981', fontSize: 11, fontWeight: '700' },

  errorText: {
    color: '#EF4444', fontSize: 13, fontWeight: '600',
    marginBottom: 12, textAlign: 'center',
  },

  submitBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  submitBtnDisabled: { backgroundColor: '#1D4ED860' },
  submitBtnText:     { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },

  skipBtn: {
    backgroundColor: '#1A1A2E', borderRadius: 14,
    padding: 14, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#2D2D44',
  },
  skipBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },

  legalFooter: {
    fontSize: 11, color: '#4B5563',
    textAlign: 'center', lineHeight: 18, marginBottom: 8,
  },
});