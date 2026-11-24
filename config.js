// Public settings. The anon key is meant to be public: the database rules and the
// functions decide what it can do. NEVER put the service role or Stripe keys here.
window.HEC_CONFIG = {
  SUPABASE_URL: 'https://okqghomenzzdoxkfogjz.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_I8DP7v_XoiUpbnPeH2F2XQ_PKc0q9Uy',
  // Monthly price shown on the sign-up page and the pay button. The amount actually charged is
  // COURSE_PRICE_CHF_CENTS in the Supabase function secrets (200 = CHF 2): keep the two the same.
  // true = paywall OFF (everyone signed in can open the courses). Set to false to charge again.
  FREE_ACCESS: false,
  PRICE_LABEL: 'CHF 2'
};
