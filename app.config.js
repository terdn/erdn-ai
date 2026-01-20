import 'dotenv/config';

export default {
  expo: {
    name: "ERDN Assistant",
    slug: "erdn-assistant",
    scheme: "erdn",
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};
