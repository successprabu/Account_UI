import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "registration": "Registration",
      "name": "Name",
      "enter_name": "Enter your name",
      "primary_phone": "Primary Phone",
      "enter_primary_phone": "Enter your primary phone number",
      "secondary_phone": "Secondary Phone",
      "enter_secondary_phone": "Enter your secondary phone number",
      "is_primary_phone_whatsup": "Primary Phone - WhatsApp",
      "is_secondary_phone_whatsup": "Secondary Phone - WhatsApp",
      "otp": "OTP",
      "enter_otp": "Enter OTP sent to your mobile/email",
      "password": "Password",
      "enter_password": "Enter your password",
      "conpassword": "Confirm Password",
      "enter_conpassword": "Confirm your password",
      "address_line1": "Address Line 1",
      "enter_address_line1": "Enter your address line 1",
      "address_line2": "Address Line 2",
      "enter_address_line2": "Enter your address line 2",
      "country": "Country",
      "select_country": "Select your country",
      "state": "State",
      "select_state": "Select your state",
      "city": "City",
      "enter_city": "Enter your city",
      "pincode": "Pincode",
      "enter_pincode": "Enter your pincode",
      "save": "Save",
      "cancel": "Cancel",
      "choose_language": "Choose Language"
    }
  },
  ta: {
    translation: {
      "registration": "பதிவு",
      "name": "பெயர்",
      "enter_name": "உங்கள் பெயரை உள்ளிடவும்",
      "primary_phone": "முதன்மை தொலைபேசி",
      "enter_primary_phone": "உங்கள் முதன்மை தொலைபேசி எண்ணை உள்ளிடவும்",
      "secondary_phone": "இரண்டாம் தொலைபேசி",
      "enter_secondary_phone": "உங்கள் இரண்டாம் தொலைபேசி எண்ணை உள்ளிடவும்",
      "is_primary_phone_whatsup": "முதன்மை தொலைபேசி - WhatsApp",
      "is_secondary_phone_whatsup": "இரண்டாம் தொலைபேசி - WhatsApp",
      "otp": "ஒடிபி",
      "enter_otp": "உங்கள் மொபைல்/மின்னஞ்சலுக்கு அனுப்பிய ஒடிபியை உள்ளிடவும்",
      "password": "கடவுச்சொல்",
      "enter_password": "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
      "conpassword": "கடவுச்சொற்கள் உறுதிப்படுத்தவும்",
      "enter_conpassword": "உங்கள் கடவுச்சொல்களை உறுதிப்படுத்தவும்",
      "address_line1": "முகவரி வரி 1",
      "enter_address_line1": "உங்கள் முகவரியை உள்ளிடவும்",
      "address_line2": "முகவரி வரி 2",
      "enter_address_line2": "உங்கள் முகவரியை உள்ளிடவும்",
      "country": "நாடு",
      "select_country": "உங்கள் நாட்டை தேர்ந்தெடுக்கவும்",
      "state": "மாநிலம்",
      "select_state": "உங்கள் மாநிலத்தை தேர்ந்தெடுக்கவும்",
      "city": "நகரம்",
      "enter_city": "உங்கள் நகரத்தை உள்ளிடவும்",
      "pincode": "அஞ்சல் குறியீடு",
      "enter_pincode": "உங்கள் அஞ்சல் குறியீட்டை உள்ளிடவும்",
      "save": "சேமிக்கவும்",
      "cancel": "ரத்து செய்",
      "choose_language": "மொழி தேர்வு செய்யவும்"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
