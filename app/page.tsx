"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
// Firebase Imports for database and authentication
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, doc, getDoc, setDoc, updateDoc, serverTimestamp, getDocs, deleteDoc, where } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaEnvelope, FaUtensils, FaMapMarkerAlt, FaCamera, FaPaperPlane, FaGlobe, FaBars, FaTimes, FaSpinner, FaSync, FaTrash, FaEye, FaLock, FaChartPie, FaChartBar } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Image from 'next/image';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// === FIREBASE CONFIGURATION ===
const firebaseConfig = {
    apiKey: "AIzaSyA-gF0atpL8f_xE27NA_YbZHurRUkKlHew",
    authDomain: "food-management-c5aff.firebaseapp.com",
    projectId: "food-management-c5aff",
    storageBucket: "food-management-c5aff.firebasestorage.app",
    messagingSenderId: "829340133934",
    appId: "1:829340133934:web:6356d9356de9f3d055cdbf",
};

// Initialize Firebase securely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// === I18N (TRANSLATION) SETUP ===
const translations = {
  en: {
    home: 'Home', about: 'About', contact: 'Contact', dashboard: 'Dashboard', newDonation: 'New Donation', availableFood: 'Available Food', login: 'Login', logout: 'Logout', language: 'English',
    heroTitle: 'Turn Surplus Food into a Lifeline.', heroSubtitle: 'Connect with local NGOs and volunteers to donate your excess food. Reduce waste, fight hunger, and build a stronger community.',
    donateFood: 'Donate Food', findFood: 'Find Food', howItWorks: 'How It Works', quickDonate: 'Quick Donate',
    step1Title: '1. List Your Donation', step1Desc: 'Donors easily list surplus food items with details like quantity and pickup time.',
    step2Title: '2. NGOs Get Notified', step2Desc: 'Registered NGOs receive real-time notifications about available food donations.',
    step3Title: '3. Food is Collected', step3Desc: 'NGOs or volunteers claim the donation and arrange for a timely pickup.',
    signInHeader: 'Sign in to your account', emailLabel: 'Email address', 
    selectRolePlaceholder: 'Select Role', roleDonor: 'Donor (Restaurant/Supermarket)', roleNgo: 'NGO / Shelter', roleAdmin: 'Admin',
    signInButton: 'Send OTP', signingInButton: 'Sending OTP...', noAccount: "Don't have an account? Register here.",
    registerHeader: 'Create a new account', registerButton: 'Register', registeringButton: 'Registering...', haveAccount: "Already have an account? Sign in.",
    createDonationTitle: 'Create a New Food Donation', foodTypeLabel: 'Food Type', foodTypePlaceholder: 'e.g., Cooked Meals, Vegetables',
    quantityLabel: 'Quantity', quantityPlaceholder: 'e.g., 10 meals, 5 kg', expiryLabel: 'Best Before / Expiry Date',
    addressLabel: 'Pickup Address', addressPlaceholder: 'Enter full address', uploadLabel: 'Upload Food Photo',
    uploadButton: 'Upload a file', uploadDragDrop: 'or drag and drop', uploadHint: 'PNG, JPG up to 10MB',
    cancel: 'Cancel', submitDonation: 'Submit Donation', submittingDonation: 'Submitting...',
    donationSuccessHeader: 'Donation Submitted!', donationSuccessText: 'Thank you for your generosity. It is now visible to all NGOs.',
    viewDetails: 'View Details', donationDetails: 'Donation Details', pleaseLogin: 'Please login to donate or find food',
    authWelcome: 'Welcome to FoodSave', authQuote: '“The best way to find yourself is to lose yourself in the service of others.”',
    aboutTitle: 'About FoodSave', aboutSubtitle: 'Our mission to reduce food waste and fight hunger',
    aboutContent: 'FoodSave is a community-driven platform that connects food donors with NGOs and volunteers to redistribute surplus food. We believe that no good food should go to waste while people in our community are hungry.',
    contactTitle: 'Contact Us', contactSubtitle: 'Get in touch with our team',
    contactContent: 'We\'d love to hear from you! Reach out to us with any questions, suggestions, or partnership opportunities.',
    success: 'Success!', error: 'Error!', donationClaimed: 'Donation claimed successfully!', donationError: 'Error claiming donation. Please try again.',
    welcomeDonor: 'Welcome, Donor', welcomeNgo: 'Welcome, NGO', welcomeAdmin: 'Welcome, Admin', yourDonations: 'Your Donations', claimedDonations: 'Claimed Donations',
    adminOverview: 'System Overview', adminUsers: 'Users', adminDonations: 'Donations', adminDonors: 'Donors', adminNgos: 'NGOs', adminTotalFood: 'Total Food Saved', adminRecentActivity: 'Recent Activity',
    adminUserManagement: 'User Management', adminDonorManagement: 'Donor Management', adminNgoManagement: 'NGO Management', adminDonationManagement: 'Donation Management',
    adminUserDetails: 'User Details', adminDonorDetails: 'Donor Details', adminNgoDetails: 'NGO Details', adminDonationDetails: 'Donation Details',
    adminEmail: 'Email', adminRole: 'Role', adminStatus: 'Status', adminActions: 'Actions', adminFoodType: 'Food Type', adminQuantity: 'Quantity',
    adminExpiry: 'Expiry Date', adminClaimedBy: 'Claimed By', adminCreatedAt: 'Created At', adminUpdatedAt: 'Updated At',
    adminActive: 'Active', adminInactive: 'Inactive', adminAvailable: 'Available', adminClaimed: 'Claimed', adminCompleted: 'Completed',
    adminView: 'View', adminEdit: 'Edit', adminDelete: 'Delete', adminRefresh: 'Refresh Data', adminExport: 'Export Data',
    adminNoUsers: 'No users found', adminNoDonors: 'No donors found', adminNoNgos: 'No NGOs found', adminNoDonations: 'No donations found',
    adminConfirmDelete: 'Are you sure you want to delete this item?', adminDeleteSuccess: 'Item deleted successfully', adminDeleteError: 'Error deleting item',
    quickDonateTitle: 'Quick Donation Form', donorNameLabel: 'Donor Name', donorNamePlaceholder: 'Enter your name',
    otpSent: 'OTP sent to your email!', otpError: 'Error sending OTP. Please try again.',
    otpVerified: 'OTP verified successfully!', verifyOtp: 'Verify OTP',
    enterOtp: 'Enter OTP received in your email', otpPlaceholder: 'Enter 6-digit OTP',
    invalidOtp: 'Invalid OTP. Please try again.',
    passwordLabel: 'Password', passwordPlaceholder: 'Enter your password',
    devModeNote: 'Development Mode: OTP will be shown in the notification',
    registerSuccess: 'Registration successful! Please login with your credentials.',
    adminStatistics: 'Statistics', adminUserDistribution: 'User Distribution', adminDonationStatus: 'Donation Status', 
    adminDonationsOverTime: 'Donations Over Time', adminOtpCredentials: 'OTP Credentials', adminOtpDetails: 'OTP Details',
    adminOtpEmail: 'Email', adminOtpCode: 'OTP Code', adminOtpCreatedAt: 'Created At', adminOtpUsed: 'Used',
    adminOtpYes: 'Yes', adminOtpNo: 'No'
  },
  hi: {
    home: 'होम', about: 'हमारे बारे में', contact: 'संपर्क', dashboard: 'डैशबोर्ड', newDonation: 'नया दान', availableFood: 'उपलब्ध भोजन', login: 'लॉग इन करें', logout: 'लॉग आउट', language: 'हिन्दी',
    heroTitle: 'बचे हुए भोजन को जीवन रेखा में बदलें।', heroSubtitle: 'अपने अतिरिक्त भोजन का दान करने के लिए स्थानीय गैर-सरकारी संगठनों और स्वयंसेवकों से जुड़ें।',
    donateFood: 'भोजन दान करें', findFood: 'भोजन खोजें', howItWorks: 'यह कैसे काम करता है', quickDonate: 'त्वरित दान',
    step1Title: '१. अपना दान सूचीबद्ध करें', step1Desc: 'दाता आसानी से अधिशेष खाद्य पदार्थों को सूचीबद्ध करते हैं।',
    step2Title: '२. NGOs को सूचित किया जाता है', step2Desc: 'पंजीकृत NGOs को वास्तविक समय पर सूचनाएं प्राप्त होती हैं।',
    step3Title: '३. भोजन एकत्र किया जाता है', step3Desc: 'NGOs दान का दावा करते हैं और पिकअप की व्यवस्था करते हैं।',
    signInHeader: 'अपने खाते में साइन इन करें', emailLabel: 'ईमेल पता', 
    selectRolePlaceholder: 'भूमिका चुनें', roleDonor: 'दाता', roleNgo: 'NGO', roleAdmin: 'एडमिन',
    signInButton: 'OTP भेजें', signingInButton: 'OTP भेजा जा रहा है...', noAccount: 'खाता नहीं है? यहां पंजीकरण करें।',
    registerHeader: 'नया खाता बनाएं', registerButton: 'पंजीकरण करें', registeringButton: 'पंजीकरण हो रहा है...', haveAccount: 'पहले से ही खाता है? साइन इन करें।',
    createDonationTitle: 'एक नया भोजन दान बनाएं', foodTypeLabel: 'भोजन का प्रकार', foodTypePlaceholder: 'जैसे, पका हुआ भोजन',
    quantityLabel: 'मात्रा', quantityPlaceholder: 'जैसे, १० भोजन', expiryLabel: 'समाप्ति तिथि',
    addressLabel: 'पिकअप पता', addressPlaceholder: 'पूरा पता दर्ज करें', uploadLabel: 'भोजन की तस्वीर अपलोड करें',
    uploadButton: 'एक फ़ाइल अपलोड करें', uploadDragDrop: 'या खींचें और छोड़ें', uploadHint: 'PNG, JPG १० एमबी तक',
    cancel: 'रद्द करें', submitDonation: 'दान जमा करें', submittingDonation: 'जमा हो रहा है...',
    donationSuccessHeader: 'दान सफलतापूर्वक जमा किया गया!', donationSuccessText: 'आपकी उदारता के लिए धन्यवाद।', viewDetails: 'विवरण देखें', donationDetails: 'दान का विवरण', pleaseLogin: 'दान करने या भोजन खोजने के लिए कृपया लॉगिन करें',
    authWelcome: 'FoodSave में आपका स्वागत है', authQuote: '"खुद को खोजने का सबसे अच्छा तरीका है खुद को दूसरों की सेवा में खो देना।"',
    aboutTitle: 'FoodSave के बारे में', aboutSubtitle: 'भोजन की बर्बादी को कम करने और भूख से लड़ने का हमारा मिशन',
    aboutContent: 'FoodSave एक सामुदायिक-संचालित मंच है जो अधिशेष भोजन को पुनर्वितरित करने के लिए भोजन दाताओं को NGOs और स्वयंसेवकों से जोड़ता है। हम मानते हैं कि कोई भी अच्छा भोजन बर्बाद नहीं होना चाहिए जब तक कि हमारे समुदाय में लोग भूखे हैं।',
    contactTitle: 'हमसे संपर्क करें', contactSubtitle: 'हमारी टीम से संपर्क करें',
    contactContent: 'हम आपसे सुनना पसंद करेंगे! किसी भी प्रश्न, सुझाव या साझेदारी के अवसरों के लिए हमसे संपर्क करें।',
    success: 'सफलता!', error: 'त्रुटि!', donationClaimed: 'दान सफलतापूर्वक क्लेम किया गया!', donationError: 'दान क्लेम करने में त्रुटि। कृपया पुन: प्रयास करें।',
    welcomeDonor: 'स्वागत, दाता', welcomeNgo: 'स्वागत, NGO', welcomeAdmin: 'स्वागत, एडमिन', yourDonations: 'आपके दान', claimedDonations: 'दावा किए गए दान',
    adminOverview: 'सिस्टम अवलोकन', adminUsers: 'उपयोगकर्ता', adminDonations: 'दान', adminDonors: 'दाता', adminNgos: 'NGOs', adminTotalFood: 'कुल बचाया गया भोजन', adminRecentActivity: 'हाल की गतिविधि',
    adminUserManagement: 'उपयोगकर्ता प्रबंधन', adminDonorManagement: 'दाता प्रबंधन', adminNgoManagement: 'NGO प्रबंधन', adminDonationManagement: 'दान प्रबंधन',
    adminUserDetails: 'उपयोगकर्ता विवरण', adminDonorDetails: 'दाता विवरण', adminNgoDetails: 'NGO विवरण', adminDonationDetails: 'दान विवरण',
    adminEmail: 'ईमेल', adminRole: 'भूमिका', adminStatus: 'स्थिति', adminActions: 'क्रियाएं', adminFoodType: 'भोजन का प्रकार', adminQuantity: 'मात्रा',
    adminExpiry: 'समाप्ति तिथि', adminClaimedBy: 'द्वारा दावा किया गया', adminCreatedAt: 'निर्मित', adminUpdatedAt: 'अपडेट किया गया',
    adminActive: 'सक्रिय', adminInactive: 'निष्क्रिय', adminAvailable: 'उपलब्ध', adminClaimed: 'दावा किया गया', adminCompleted: 'पूर्ण',
    adminView: 'देखें', adminEdit: 'संपादित करें', adminDelete: 'हटाएं', adminRefresh: 'डेटा रीफ्रेश करें', adminExport: 'डेटा निर्यात करें',
    adminNoUsers: 'कोई उपयोगकर्ता नहीं मिला', adminNoDonors: 'कोई दाता नहीं मिला', adminNoNgos: 'कोई NGO नहीं मिला', adminNoDonations: 'कोई दान नहीं मिला',
    adminConfirmDelete: 'क्या आप वाकई इस आइटम को हटाना चाहते हैं?', adminDeleteSuccess: 'आइटम सफलतापूर्वक हटा दिया गया', adminDeleteError: 'आइटम हटाने में त्रुटि',
    quickDonateTitle: 'त्वरित दान फॉर्म', donorNameLabel: 'दाता का नाम', donorNamePlaceholder: 'अपना नाम प्रविष्ट करा',
    otpSent: 'आपके ईमेल पर OTP भेजा गया!', otpError: 'OTP भेजने में त्रुटि। कृपया पुन: प्रयास करें।',
    otpVerified: 'OTP सफलतापूर्वक सत्यापित!', verifyOtp: 'OTP सत्यापित करें',
    enterOtp: 'अपने ईमेल में प्राप्त OTP दर्ज करें', otpPlaceholder: '6-अंकों का OTP दर्ज करें',
    invalidOtp: 'अमान्य OTP। कृपया पुन: प्रयास करें।',
    passwordLabel: 'पासवर्ड', passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    devModeNote: 'डेवलपमेंट मोड: OTP नोटिफिकेशन में दिखाया जाएगा',
    registerSuccess: 'पंजीकरण सफल! कृपया अपने क्रेडेंशियल्ससह लॉग इन करें।',
    adminStatistics: 'आँकड़े', adminUserDistribution: 'उपयोगकर्ता वितरण', adminDonationStatus: 'दान स्थिति', 
    adminDonationsOverTime: 'समय के साथ दान', adminOtpCredentials: 'OTP क्रेडेंशियल', adminOtpDetails: 'OTP विवरण',
    adminOtpEmail: 'ईमेल', adminOtpCode: 'OTP कोड', adminOtpCreatedAt: 'निर्मित', adminOtpUsed: 'उपयोग किया गया',
    adminOtpYes: 'हाँ', adminOtpNo: 'नहीं'
  },
  mr: {
    home: 'मुख्यपृष्ठ', about: 'आमच्याबद्दल', contact: 'संपर्क', dashboard: 'डॅशबोर्ड', newDonation: 'नवीन दान', availableFood: 'उपलब्ध अन्न', login: 'लॉग इन करा', logout: 'लॉग आउट', language: 'मराठी',
    heroTitle: 'शिल्लक अन्नाला जीवदान द्या.', heroSubtitle: 'अतिरिक्त अन्न दान करण्यासाठी स्थानिक स्वयंसेवी संस्थांशी संपर्क साधा.',
    donateFood: 'अन्न दान करा', findFood: 'अन्न शोधा', howItWorks: 'हे कसे कार्य करते', quickDonate: 'त्वरित दान',
    step1Title: '१. तुमचे दान सूचीबद्ध करा', step1Desc: 'दाते सहजपणे अतिरिक्त खाद्यपदार्थ सूचीबद्ध करतात.',
    step2Title: '२. NGOs ना सूचित केले जाते', step2Desc: 'नोंदणीकृत NGOs ना रिअल-टाइम सूचना मिळतात.',
    step3Title: '३. अन्न गोळा केले जाते', step3Desc: 'NGOs दानाचा दावा करतात आणि उचलण्याची व्यवस्था करतात.',
    signInHeader: 'तुमच्या खात्यात साइन इन करा', emailLabel: 'ईमेल पत्ता', 
    selectRolePlaceholder: 'भूमिका निवडा', roleDonor: 'दाता', roleNgo: 'NGO', roleAdmin: 'ऍडमिन',
    signInButton: 'OTP पाठवा', signingInButton: 'OTP पाठवत आहे...', noAccount: 'खाते नाही? येथे नोंदणी करा.',
    registerHeader: 'नवीन खाते तयार करा', registerButton: 'नोंदणी करा', registeringButton: 'नोंदणी करत आहे...', haveAccount: 'आधीपासूनच खाते आहे? साइन इन करा.',
    createDonationTitle: 'नवीन अन्नदान तयार करा', foodTypeLabel: 'अन्नाचा प्रकार', foodTypePlaceholder: 'उदा. शिजवलेले जेवण',
    quantityLabel: 'प्रमाण', quantityPlaceholder: 'उदा. १० जेवण', expiryLabel: 'समाप्तीची तारीख',
    addressLabel: 'पिकअप पत्ता', addressPlaceholder: 'पूर्ण पत्ता प्रविष्ट करा', uploadLabel: 'अन्नाचा फोटो अपलोड करा',
    uploadButton: 'फाईल अपलोड करा', uploadDragDrop: 'किंवा ड्रॅग आणि ड्रॉप करा', uploadHint: 'PNG, JPG १०MB पर्यंत',
    cancel: 'रद्द करा', submitDonation: 'दान सबमिट करा', submittingDonation: 'सबमिट करत आहे...',
    donationSuccessHeader: 'दान यशस्वीरित्या सबमिट केले!', donationSuccessText: 'तुमच्या उदारतेबद्दल धन्यवाद.', viewDetails: 'तपशील बघा', donationDetails: 'दानाचा तपशील', pleaseLogin: 'अन्नदान करण्यासाठी किंवा शोधण्यासाठी कृपया लॉगिन करा',
    authWelcome: 'FoodSave मध्ये आपले स्वागत आहे', authQuote: '"स्वतःला शोधण्याचा सर्वोत्तम मार्ग म्हणजे इतरांच्या सेवेत स्वतःला झोकून देणे."',
    aboutTitle: 'FoodSave बद्दल', aboutSubtitle: 'अन्न बेकारी कमी करणे आणि भूक लढवणे आमचे ध्येय',
    aboutContent: 'FoodSave हा एक समुदाय-चालित प्लॅटफॉर्म आहे जो अधिशेष अन्न पुनर्वितरित करण्यासाठी अन्न दाते आणि NGOs व स्वयंसेवकांना जोडतो. आम्ही विश्वास ठेवतो की जोपर्यंत आमच्या समुदायातील लोक भूके आहेत, तोपर्यंत चांगले अन्न बेकार जाऊ नये.',
    contactTitle: 'आमच्याशी संपर्क साधा', contactSubtitle: 'आमच्या टीमसोबत संपर्क साधा',
    contactContent: 'आम्ही तुमच्याकडून ऐकून आनंद होईल! कोणत्याही प्रश्न, सूचना किंवा भागीदारीच्या संधींसाठी आमच्याशी संपर्क साधा.',
    success: 'यश!', error: 'त्रुटी!', donationClaimed: 'दान यशस्वीरित्या क्लेम केले!', donationError: 'दान क्लेम करण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    welcomeDonor: 'स्वागत, दाता', welcomeNgo: 'स्वागत, NGO', welcomeAdmin: 'स्वागत, एडमिन', yourDonations: 'तुमचे दान', claimedDonations: 'दावा केलेले दान',
    adminOverview: 'प्रणाली अवलोकन', adminUsers: 'वापरकर्ते', adminDonations: 'दान', adminDonors: 'दाता', adminNgos: 'NGOs', adminTotalFood: 'एकूण बचलेले अन्न', adminRecentActivity: 'अलीकडील क्रियाकलाप',
    adminUserManagement: 'वापरकर्ता व्यवस्थापन', adminDonorManagement: 'दाता व्यवस्थापन', adminNgoManagement: 'NGO व्यवस्थापन', adminDonationManagement: 'दान व्यवस्थापन',
    adminUserDetails: 'वापरकर्ता तपशील', adminDonorDetails: 'दाता तपशील', adminNgoDetails: 'NGO तपशील', adminDonationDetails: 'दान तपशील',
    adminEmail: 'ईमेल', adminRole: 'भूमिका', adminStatus: 'स्थिती', adminActions: 'क्रिया', adminFoodType: 'अन्नाचा प्रकार', adminQuantity: 'प्रमाण',
    adminExpiry: 'समाप्ती तारीख', adminClaimedBy: 'द्वारा दावा केले', adminCreatedAt: 'तयार केले', adminUpdatedAt: 'अपडेट केले',
    adminActive: 'सक्रिय', adminInactive: 'निष्क्रिय', adminAvailable: 'उपलब्ध', adminClaimed: 'दावा केले', adminCompleted: 'पूर्ण झाले',
    adminView: 'पहा', adminEdit: 'संपादित करा', adminDelete: 'हटवा', adminRefresh: 'डेटा रीफ्रेश करा', adminExport: 'डेटा निर्यात करा',
    adminNoUsers: 'कोणतेही वापरकर्ते आढळले नाहीत', adminNoDonors: 'कोणतेही दाता आढळले नाहीत', adminNoNgos: 'कोणतीही NGO आढळली नाही', adminNoDonations: 'कोणतेही दान आढळले नाही',
    adminConfirmDelete: 'तुम्हाला खात्री आहे की तुम्ही हे आयटम हटवू इच्छिता?', adminDeleteSuccess: 'आयटम यशस्वीरित्या हटवले', adminDeleteError: 'आयटम हटवण्यात त्रुटी',
    quickDonateTitle: 'त्वरित दान फॉर्म', donorNameLabel: 'दात्याचे नाव', donorNamePlaceholder: 'आपले नाव प्रविष्ट करा',
    otpSent: 'आपल्या ईमेलवर OTP पाठवला!', otpError: 'OTP पाठवण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    otpVerified: 'OTP यशस्वीरित्या सत्यापित!', verifyOtp: 'OTP सत्यापित करा',
    enterOtp: 'आपल्या ईमेलमध्ये प्राप्त OTP प्रविष्ट करा', otpPlaceholder: '६-अंकी OTP प्रविष्ट करा',
    invalidOtp: 'अवैध OTP. कृपया पुन्हा प्रयत्न करा.',
    passwordLabel: 'पासवर्ड', passwordPlaceholder: 'आपला पासवर्ड प्रविष्ट करा',
    devModeNote: 'विकास मोड: नोटिफिकेशनमध्ये OTP दर्शविले जाईल',
    registerSuccess: 'नोंदणी यशस्वी! कृपया आपल्या क्रेडेन्शियल्ससह लॉग इन करा.',
    adminStatistics: 'सांख्यिकी', adminUserDistribution: 'वापरकर्ता वितरण', adminDonationStatus: 'दान स्थिती', 
    adminDonationsOverTime: 'कालावधीतील दान', adminOtpCredentials: 'OTP क्रेडेन्शियल्स', adminOtpDetails: 'OTP तपशील',
    adminOtpEmail: 'ईमेल', adminOtpCode: 'OTP कोड', adminOtpCreatedAt: 'निर्मित', adminOtpUsed: 'वापरले',
    adminOtpYes: 'होय', adminOtpNo: 'नाही'
  },
};

// === CONTEXTS ===
const LanguageContext = createContext(null);
const LanguageProvider = ({ children }) => { 
  const [language, setLanguage] = useState('en'); 
  const t = (key) => translations[language]?.[key] || key; 
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  ); 
};
const useTranslation = () => useContext(LanguageContext);

// === UI COMPONENTS ===
const Header = ({ setPage, user, setUser }) => {
    const { t, setLanguage, language } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    
    const navLinks = {
        null: [{ name: t('home'), page: 'home' }, { name: t('about'), page: 'about' }, { name: t('contact'), page: 'contact' }],
        donor: [{ name: t('dashboard'), page: 'donorDashboard' }, { name: t('newDonation'), page: 'donationForm' }, { name: t('availableFood'), page: 'listings' }],
        ngo: [{ name: t('dashboard'), page: 'ngoDashboard' }, { name: t('availableFood'), page: 'listings' }],
        admin: [{ name: t('dashboard'), page: 'adminDashboard' }],
    };

    const handleLogout = async () => { 
      await signOut(auth); 
      setUser(null); 
      setPage('home'); 
      toast.success('Logged out successfully!');
    };
    
    const handleLanguageChange = (lang) => { 
      setLanguage(lang); 
      setIsLangOpen(false); 
    };

    return (
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <div className="bg-white p-2 rounded-lg mr-2">
                            <FaUtensils className="h-6 w-6 text-indigo-600" />
                        </div>
                        <span 
                          onClick={() => setPage('home')} 
                          className="text-2xl font-bold text-white cursor-pointer hover:text-indigo-200 transition-colors duration-300"
                        >
                          FoodSave
                        </span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        {(navLinks[user?.role] || navLinks.null).map(link => ( 
                          <a 
                            key={link.page} 
                            href="#" 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              setPage(link.page); 
                            }} 
                            className="text-white hover:text-indigo-200 transition duration-150 ease-in-out relative group"
                          >
                            {link.name}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                          </a>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <button 
                              onClick={() => setIsLangOpen(!isLangOpen)} 
                              className="flex items-center text-white hover:text-indigo-200 transition-colors duration-300"
                            >
                              <FaGlobe className="h-5 w-5 mr-2" /> {t('language')}
                            </button>
                            {isLangOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 transition-all duration-300 transform origin-top-right">
                                    <a 
                                      href="#" 
                                      onClick={(e) => {
                                        e.preventDefault(); 
                                        handleLanguageChange('en')
                                      }} 
                                      className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                        language === 'en' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      English
                                    </a>
                                    <a 
                                      href="#" 
                                      onClick={(e) => {
                                        e.preventDefault(); 
                                        handleLanguageChange('hi')
                                      }} 
                                      className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                        language === 'hi' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      हिन्दी
                                    </a>
                                    <a 
                                      href="#" 
                                      onClick={(e) => {
                                        e.preventDefault(); 
                                        handleLanguageChange('mr')
                                      }} 
                                      className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                        language === 'mr' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      मराठी
                                    </a>
                                </div>
                            )}
                        </div>
                        {user ? ( 
                          <button 
                            onClick={handleLogout} 
                            className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
                          >
                            {t('logout')}
                          </button>
                        ) : ( 
                          <button 
                            onClick={() => setPage('login')} 
                            className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
                          >
                            {t('login')}
                          </button>
                        )}
                    </div>
                    <div className="md:hidden flex items-center">
                        <button 
                          onClick={() => setIsMenuOpen(!isMenuOpen)} 
                          className="text-white hover:text-indigo-200 focus:outline-none transition-colors duration-300"
                        >
                          {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && ( 
              <div className="md:hidden bg-indigo-700 shadow-lg transition-all duration-300">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {(navLinks[user?.role] || navLinks.null).map(link => ( 
                    <a 
                      key={link.page} 
                      href="#" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setPage(link.page); 
                        setIsMenuOpen(false); 
                      }} 
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-indigo-200 hover:bg-indigo-600 transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  ))}
                  {user ? ( 
                    <a 
                      href="#" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        handleLogout(); 
                        setIsMenuOpen(false); 
                      }} 
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-indigo-200 hover:bg-red-500 transition-colors duration-300"
                    >
                      {t('logout')}
                    </a>
                  ) : ( 
                    <a 
                      href="#" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setPage('login'); 
                        setIsMenuOpen(false); 
                      }} 
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-indigo-200 hover:bg-indigo-600 transition-colors duration-300"
                    >
                      {t('login')}
                    </a>
                  )}
                </div>
              </div>
            )}
        </header>
    );
};

const HomePage = ({ setPage, user }) => {
    const { t } = useTranslation();
    const handleActionClick = (page) => user ? setPage(page) : setPage('login');
    const [showQuickDonate, setShowQuickDonate] = useState(false);

    return (
        <div className="flex flex-col relative overflow-hidden">
            {/* Interactive Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50"></div>
                <div className="absolute top-0 left-0 w-full h-full">
                    {[...Array(20)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute rounded-full bg-white bg-opacity-20 animate-pulse"
                            style={{
                                width: `${Math.random() * 100 + 20}px`,
                                height: `${Math.random() * 100 + 20}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDuration: `${Math.random() * 10 + 10}s`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 flex flex-col">
                <section className="relative text-center py-20 lg:py-32 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80')" }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/80"></div>
                    <div className="relative container mx-auto px-4">
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-4 animate-fade-in-down" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                          {t('heroTitle')}
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                          {t('heroSubtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button 
                              onClick={() => handleActionClick('donationForm')} 
                              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 duration-300 shadow-lg w-full sm:w-auto cursor-pointer"
                            >
                              {t('donateFood')}
                            </button>
                            <button 
                              onClick={() => setShowQuickDonate(true)} 
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 duration-300 shadow-lg w-full sm:w-auto cursor-pointer"
                            >
                              {t('quickDonate')}
                            </button>
                            <button 
                              onClick={() => handleActionClick('listings')} 
                              className="bg-white text-indigo-600 border-2 border-indigo-500 px-8 py-3 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all transform hover:scale-105 duration-300 shadow-lg w-full sm:w-auto cursor-pointer"
                            >
                              {t('findFood')}
                            </button>
                        </div>
                        {!user && <p className="mt-4 text-indigo-200 text-sm animate-fade-in-up">{t('pleaseLogin')}</p>}
                    </div>
                </section>
                
                {/* Quick Donate Modal */}
                {showQuickDonate && (
                    <QuickDonateForm onClose={() => setShowQuickDonate(false)} />
                )}
                
                <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="container mx-auto px-4">
                      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{t('howItWorks')}</h2>
                      <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-indigo-100">
                          <div className="bg-indigo-100 rounded-full p-6 mb-4 transition-all duration-300 hover:bg-indigo-200">
                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{t('step1Title')}</h3>
                          <p className="text-gray-600">{t('step1Desc')}</p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-indigo-100">
                          <div className="bg-indigo-100 rounded-full p-6 mb-4 transition-all duration-300 hover:bg-indigo-200">
                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{t('step2Title')}</h3>
                          <p className="text-gray-600">{t('step2Desc')}</p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-indigo-100">
                          <div className="bg-indigo-100 rounded-full p-6 mb-4 transition-all duration-300 hover:bg-indigo-200">
                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10M16 16V6a1 1 0 011-1h4a1 1 0 011 1v10l-2 2h-3a1 1 0 01-1-1zM16 11h6"></path>
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{t('step3Title')}</h3>
                          <p className="text-gray-600">{t('step3Desc')}</p>
                        </div>
                      </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// Quick Donate Form Component
const QuickDonateForm = ({ onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ 
        donorName: '', 
        foodType: '', 
        quantity: '', 
        expiry: '', 
        address: '' 
    }); 
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleInputChange = (e) => { 
        const { id, value } = e.target; 
        setFormData(prev => ({ ...prev, [id]: value })); 
    };
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);
        
        try {
            await addDoc(collection(db, 'quickDonations'), {
                donorName: formData.donorName,
                type: formData.foodType, 
                quantity: formData.quantity, 
                expiry: formData.expiry, 
                address: formData.address,
                location: { lat: 19.0760, lng: 72.8777 }, 
                status: 'Available',
                donorImage: imagePreview || null,
                createdAt: serverTimestamp(),
            });
            
            setIsSubmitting(false);
            toast.success('Quick donation submitted successfully! NGOs will be notified.');
            setFormData({ 
                donorName: '', 
                foodType: '', 
                quantity: '', 
                expiry: '', 
                address: '' 
            });
            setImagePreview(null);
            onClose();
        } catch (error) { 
            console.error("Error adding document: ", error); 
            setIsSubmitting(false);
            toast.error('Error submitting donation. Please try again.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 z-50 flex justify-center items-start md:items-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-fade-in-up mt-16 md:mt-0">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                <FaUtensils className="h-6 w-6 text-indigo-600" />
                            </div>
                            {t('quickDonateTitle')}
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-300 bg-gray-100 p-2 rounded-full"
                        >
                            <FaTimes className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('donorNameLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="donorName" 
                                value={formData.donorName} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                                placeholder={t('donorNamePlaceholder')} 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('foodTypeLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="foodType" 
                                value={formData.foodType} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                                placeholder={t('foodTypePlaceholder')} 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('quantityLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="quantity" 
                                value={formData.quantity} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                                placeholder={t('quantityPlaceholder')} 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('expiryLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="date" 
                                id="expiry" 
                                value={formData.expiry} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('addressLabel')} <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                id="address" 
                                rows="2" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                                placeholder={t('addressPlaceholder')}
                            ></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('uploadLabel')}
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors duration-300 bg-gray-50">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <div className="flex flex-col items-center">
                                            <Image 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                width={128}
                                                height={128}
                                                className="h-32 w-32 object-cover rounded-lg mb-2" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setImagePreview(null)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                    <span>{t('uploadButton')}</span>
                                                    <input 
                                                        id="file-upload" 
                                                        name="file-upload" 
                                                        type="file" 
                                                        className="sr-only" 
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                                <p className="pl-1">{t('uploadDragDrop')}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{t('uploadHint')}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-300 font-medium"
                            >
                                {t('cancel')}
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center disabled:bg-indigo-400 transition-all duration-300 transform hover:scale-105"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                        {t('submittingDonation')}
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane className="mr-2" />
                                        {t('submitDonation')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const LeafletMap = ({ locations, center = [19.0760, 72.8777] }) => {
    const mapContainer = useRef(null); 
    const map = useRef(null);
    
    useEffect(() => { 
      if (typeof window === 'undefined' || !mapContainer.current) return; 
      let isMounted = true; 
      
      const cssUrl = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'; 
      if (!document.querySelector(`link[href="${cssUrl}"]`)) { 
        const link = document.createElement('link'); 
        link.rel = 'stylesheet'; 
        link.href = cssUrl; 
        document.head.appendChild(link); 
      } 
      
      import('leaflet').then(L => { 
        if (!isMounted) return; 
        
        delete L.Icon.Default.prototype._getIconUrl; 
        L.Icon.Default.mergeOptions({ 
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png', 
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', 
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', 
        }); 
        
        if (!map.current && mapContainer.current) { 
          map.current = L.map(mapContainer.current).setView(center, 12); 
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            attribution: '&copy; OpenStreetMap' 
          }).addTo(map.current); 
        } 
        
        if (map.current) { 
          map.current.eachLayer((layer) => { 
            if (layer instanceof L.Marker) { 
              map.current.removeLayer(layer); 
            } 
          }); 
          
          locations.forEach(loc => { 
            if (loc.location) { 
              L.marker([loc.location.lat, loc.location.lng])
                .addTo(map.current)
                .bindPopup(`<b>${loc.donor || loc.donorName}</b><br>${loc.type}`)
                .openPopup(); 
            } 
          }); 
        } 
      }).catch(console.error); 
      
      return () => { 
        isMounted = false; 
        if (map.current) { 
          map.current.remove(); 
          map.current = null; 
        } 
      }; 
    }, [locations, center]);
    
    return <div ref={mapContainer} style={{ height: '100%', minHeight: '400px', width: '100%' }} className="rounded-lg shadow-md z-0" />;
};

const ListingsPage = ({donations, quickDonations, user}) => {
    const { t } = useTranslation();
    const isLoading = !donations;
    
    const handleClaim = async (donationId, isQuick = false) => { 
      if(user.role !== 'ngo'){
        toast.error(t('donationError'));
        return;
      }
      
      try {
        const collectionName = isQuick ? 'quickDonations' : 'donations';
        const donationRef = doc(db, collectionName, donationId);
        await updateDoc(donationRef, { 
          status: 'Claimed', 
          claimedBy: user.uid,
          claimedAt: serverTimestamp()
        });
        toast.success(t('donationClaimed'));
      } catch (error) {
        console.error("Error claiming donation:", error);
        toast.error(t('donationError'));
      }
    };
    
    // Combine regular donations and quick donations
    const allDonations = [
        ...(donations || []).map(d => ({ ...d, isQuick: false })),
        ...(quickDonations || []).map(d => ({ ...d, isQuick: true }))
    ];
    
    return ( 
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('availableFood')}</h1>
        {isLoading ? ( 
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" /> 
            <span className="text-lg">Loading donations...</span>
          </div>
        ) : ( 
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 flex flex-col gap-4">
              {allDonations.filter(d => d.status === 'Available').map(donation => ( 
                <div 
                  key={donation.id} 
                  className="bg-white p-4 rounded-xl shadow-md border flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:border-indigo-300"
                >
                  {donation.donorImage ? (
                    <Image 
                      src={donation.donorImage} 
                      alt={donation.type} 
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-lg object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-indigo-700">{donation.donor || donation.donorName}</h3>
                    <p className="text-gray-600">{donation.type} - {donation.quantity}</p>
                    <p className="text-sm text-gray-500">Expires: {donation.expiry}</p>
                    <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="mr-1" /> Mumbai
                        {donation.isQuick && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Quick</span>
                        )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleClaim(donation.id, donation.isQuick)} 
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all duration-300 disabled:bg-gray-400 transform hover:scale-105"
                    disabled={user.role !== 'ngo'}
                  >
                    Claim
                  </button>
                </div>
              ))}
              {allDonations.filter(d => d.status === 'Available').length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-md">
                  <p>No donations available at the moment. Please check back later.</p>
                </div>
              )}
            </div>
            <div className="lg:w-1/2 rounded-xl overflow-hidden shadow-lg">
              <LeafletMap locations={allDonations.filter(d => d.status === 'Available')} />
            </div>
          </div>
        )} 
      </div>
    ); 
};

// Login with OTP Component
const Login = ({ setUser, setPage }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [role, setRole] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [usePassword, setUsePassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Generate a 6-digit OTP
    const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // For development, we'll simulate OTP without actually sending email
            const otpCode = generateOtp();
            
            // Save OTP to Firebase with timestamp
            await addDoc(collection(db, 'otpCredentials'), {
                email: email,
                otp: otpCode,
                createdAt: serverTimestamp(),
                used: false
            });
            
            setIsOtpSent(true);
            setCountdown(60); // Start 60-second countdown
            toast.success(`${t('otpSent')} For development, your OTP is: ${otpCode}`);
        } catch (err) {
            console.error("Error sending OTP:", err);
            setError(err.message);
            toast.error(t('otpError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || !email) {
            setError('Please enter OTP');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Query for the OTP in Firebase
            const otpQuery = query(
                collection(db, 'otpCredentials'),
                where('email', '==', email),
                where('otp', '==', otp),
                where('used', '==', false)
            );
            
            const querySnapshot = await getDocs(otpQuery);
            
            if (querySnapshot.empty) {
                throw new Error('Invalid OTP');
            }

            // Mark the OTP as used
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, { used: true });

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, "users", email));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({ 
                    uid: email, // Using email as uid for simplicity
                    email: email, 
                    role: userData.role 
                });
                toast.success(t('otpVerified'));
                
                if (userData.role === 'donor') setPage('donorDashboard'); 
                else if (userData.role === 'ngo') setPage('ngoDashboard');
                else setPage('adminDashboard');
            } else if (role) {
                // New user with role selected
                await setDoc(doc(db, "users", email), { 
                    email: email, 
                    role: role 
                });
                setUser({ 
                    uid: email, 
                    email: email, 
                    role: role 
                });
                toast.success(t('otpVerified'));
                
                if (role === 'donor') setPage('donorDashboard'); 
                else if (role === 'ngo') setPage('ngoDashboard');
                else setPage('adminDashboard');
            } else {
                setError('Please select a role for registration');
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setError(err.message);
            toast.error(t('invalidOtp'));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Try to sign in with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({ 
                    uid: user.uid, 
                    email: user.email, 
                    role: userData.role 
                });
                toast.success('Login successful!');
                
                if (userData.role === 'donor') setPage('donorDashboard'); 
                else if (userData.role === 'ngo') setPage('ngoDashboard');
                else setPage('adminDashboard');
            } else {
                setError('User not found in database');
            }
        } catch (err) {
            console.error("Error signing in:", err);
            setError(err.message);
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordRegister = async (e) => {
        e.preventDefault();
        if (!email || !password || !role) {
            setError('Please fill all fields');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), { 
                email: email, 
                role: role,
                createdAt: serverTimestamp()
            });
            
            setUser({ 
                uid: user.uid, 
                email: user.email, 
                role: role 
            });
            
            toast.success(t('registerSuccess'));
            
            if (role === 'donor') setPage('donorDashboard'); 
            else if (role === 'ngo') setPage('ngoDashboard');
            else setPage('adminDashboard');
        } catch (err) {
            console.error("Error registering:", err);
            setError(err.message);
            toast.error('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        // Check if user is coming from email link
        const urlParams = new URLSearchParams(window.location.search);
        const emailFromUrl = urlParams.get('email');
        if (emailFromUrl) {
            setEmail(emailFromUrl);
            setIsOtpSent(true);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            <div className="relative w-full max-w-md">
                {/* Background decoration */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>
                
                <div className="relative z-10 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <FaUtensils className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">{t('authWelcome')}</h2>
                            <p className="text-gray-600 mt-2 italic">{t('authQuote')}</p>
                        </div>
                        
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setUsePassword(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                                        !usePassword
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    OTP Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUsePassword(true)}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                                        usePassword
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Password Login
                                </button>
                            </div>
                        </div>
                        
                        {usePassword ? (
                            <>
                                {!isRegistering ? (
                                    <form className="space-y-6" onSubmit={handlePasswordLogin}>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('emailLabel')}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('passwordLabel')}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaLock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                                                    placeholder={t('passwordPlaceholder')}
                                                />
                                            </div>
                                        </div>
                                        
                                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
                                        
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                                            >
                                                {isLoading && <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                                                {isLoading ? 'Signing in...' : 'Sign In'}
                                            </button>
                                        </div>
                                        
                                        <div className="text-sm text-center">
                                            <button
                                                type="button"
                                                onClick={() => setIsRegistering(true)}
                                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                                            >
                                                {t('noAccount')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form className="space-y-6" onSubmit={handlePasswordRegister}>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('emailLabel')}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('passwordLabel')}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaLock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                                                    placeholder={t('passwordPlaceholder')}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('selectRolePlaceholder')}
                                            </label>
                                            <select
                                                id="role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                                            >
                                                <option value="">{t('selectRolePlaceholder')}</option>
                                                <option value="donor">{t('roleDonor')}</option>
                                                <option value="ngo">{t('roleNgo')}</option>
                                                <option value="admin">{t('roleAdmin')}</option>
                                            </select>
                                        </div>
                                        
                                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
                                        
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                                            >
                                                {isLoading && <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                                                {isLoading ? t('registeringButton') : t('registerButton')}
                                            </button>
                                        </div>
                                        
                                        <div className="text-sm text-center">
                                            <button
                                                type="button"
                                                onClick={() => setIsRegistering(false)}
                                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                                            >
                                                {t('haveAccount')}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        ) : (
                            <>
                                {!isOtpSent ? (
                                    <form className="space-y-6" onSubmit={handleSendOtp}>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('emailLabel')}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>
                                        
                                        {!isLoginView && (
                                            <div>
                                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t('selectRolePlaceholder')}
                                                </label>
                                                <select
                                                    id="role"
                                                    value={role}
                                                    onChange={(e) => setRole(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                                                >
                                                    <option value="">{t('selectRolePlaceholder')}</option>
                                                    <option value="donor">{t('roleDonor')}</option>
                                                    <option value="ngo">{t('roleNgo')}</option>
                                                    <option value="admin">{t('roleAdmin')}</option>
                                                </select>
                                            </div>
                                        )}
                                        
                                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
                                        
                                        <div className="text-xs text-center text-indigo-600 bg-indigo-50 p-2 rounded-md">
                                            {t('devModeNote')}
                                        </div>
                                        
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                                            >
                                                {isLoading && <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                                                {isLoading ? t('signingInButton') : t('signInButton')}
                                            </button>
                                        </div>
                                        
                                        <div className="text-sm text-center">
                                            <button
                                                type="button"
                                                onClick={() => setIsLoginView(!isLoginView)}
                                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                                            >
                                                {isLoginView ? t('noAccount') : t('haveAccount')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form className="space-y-6" onSubmit={handleVerifyOtp}>
                                        <div className="text-center mb-4">
                                            <p className="text-gray-600">We've sent a 6-digit OTP to your email</p>
                                            <p className="text-sm text-gray-500 mt-1">Please check your inbox and enter the code below</p>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('enterOtp')}
                                            </label>
                                            <input
                                                id="otp"
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 text-center text-lg tracking-widest"
                                                placeholder={t('otpPlaceholder')}
                                                maxLength={6}
                                            />
                                        </div>
                                        
                                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
                                        
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                                            >
                                                {isLoading && <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                                                {isLoading ? 'Verifying...' : t('verifyOtp')}
                                            </button>
                                        </div>
                                        
                                        <div className="text-sm text-center">
                                            <button
                                                type="button"
                                                onClick={() => setIsOtpSent(false)}
                                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                                            >
                                                Back to Login
                                            </button>
                                            
                                            {countdown > 0 ? (
                                                <p className="text-gray-500 mt-2">
                                                    Resend OTP in {countdown}s
                                                </p>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    className="text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                                                >
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DonorDashboard = ({ user, donations, refreshData }) => {
    const [selectedDonation, setSelectedDonation] = useState(null);
    const { t } = useTranslation();
    const userDonations = donations?.filter(d => d.donorId === user.uid) || [];
    
    // Extract user name from email (before @ symbol)
    const userName = user.email ? user.email.split('@')[0] : 'User';

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full mr-4">
                            <FaUser className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{t('welcomeDonor')}</h1>
                            <p className="text-gray-600">{userName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={refreshData} 
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors duration-300 flex items-center"
                    >
                        <FaSync className="mr-2" />
                        {t('adminRefresh')}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md border border-indigo-100">
                        <h3 className="text-lg font-semibold text-gray-700">Total Donations</h3>
                        <p className="text-3xl font-bold text-indigo-600 mt-2">{userDonations.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-md border border-green-100">
                        <h3 className="text-lg font-semibold text-gray-700">Available</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {userDonations.filter(d => d.status === 'Available').length}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-md border border-yellow-100">
                        <h3 className="text-lg font-semibold text-gray-700">Claimed</h3>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">
                            {userDonations.filter(d => d.status === 'Claimed').length}
                        </p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">{t('yourDonations')}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="p-3">Food Type</th>
                                <th className="p-3">Quantity</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                                {userDonations.map(d => (
                                    <tr key={d.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                                        <td className="p-3">{d.type}</td>
                                        <td className="p-3">{d.quantity}</td>
                                        <td className="p-3">
                                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            d.status === 'Available' ? 'bg-green-100 text-green-800' : 
                                            d.status === 'Claimed' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-blue-100 text-blue-800'
                                          }`}>
                                            {d.status}
                                          </span>
                                        </td>
                                        <td className="p-3">
                                          <button 
                                            onClick={() => setSelectedDonation(d)} 
                                            className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
                                          >
                                            <FaEye className="inline mr-1" />
                                            {t('viewDetails')}
                                          </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {userDonations.length === 0 && <p className="text-center text-gray-500 py-4">You have not made any donations yet.</p>}
                    </div>
                </div>
            </div>
            {selectedDonation && <DonationViewModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} />}
        </>
    );
};

const DonationViewModal = ({ donation, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all animate-fade-in-up">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold text-gray-800">{t('donationDetails')}</h2>
                      <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="mt-4">
                      {donation.donorImage && (
                        <Image 
                          src={donation.donorImage} 
                          alt={donation.type} 
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover rounded-lg mb-4" 
                        />
                      )}
                      <h3 className="text-xl font-semibold text-indigo-700">{donation.type}</h3>
                      <p className="text-gray-600">from <span className="font-medium">{donation.donor || donation.donorName}</span></p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-semibold text-gray-800">{donation.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Expires On</p>
                          <p className="font-semibold text-gray-800">{donation.expiry}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              donation.status === 'Available' ? 'bg-green-100 text-green-800' : 
                              donation.status === 'Claimed' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {donation.status}
                            </span>
                          </p>
                        </div>
                        {donation.claimedAt && (
                          <div>
                            <p className="text-gray-500">Claimed At</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(donation.claimedAt.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NGODashboard = ({donations, quickDonations, user, refreshData}) => { 
    const claimedByMe = [
        ...(donations?.filter(d => d.claimedBy === user.uid) || []),
        ...(quickDonations?.filter(d => d.claimedBy === user.uid) || [])
    ];
    const { t } = useTranslation();
    
    // Extract user name from email (before @ symbol)
    const userName = user.email ? user.email.split('@')[0] : 'User';
    
    // Combine regular donations and quick donations
    const allDonations = [
        ...(donations || []).map(d => ({ ...d, isQuick: false })),
        ...(quickDonations || []).map(d => ({ ...d, isQuick: true }))
    ];
    
    return ( 
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-full mr-4">
                    <FaUser className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('welcomeNgo')}</h1>
                    <p className="text-gray-600">{userName}</p>
                </div>
            </div>
            <button 
                onClick={refreshData} 
                className="bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors duration-300 flex items-center"
            >
                <FaSync className="mr-2" />
                {t('adminRefresh')}
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-md border border-green-100">
            <h3 className="text-lg font-semibold text-gray-700">Total Donations</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{allDonations.length || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-md border border-green-100">
            <h3 className="text-lg font-semibold text-gray-700">Claimed by You</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{claimedByMe.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-md border border-yellow-100">
            <h3 className="text-lg font-semibold text-gray-700">Available Now</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {allDonations.filter(d => d.status === 'Available').length || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('claimedDonations')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3">Donor</th>
                  <th className="p-3">Food Type</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {claimedByMe.map(d => ( 
                  <tr key={d.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                    <td className="p-3">{d.donor || d.donorName}</td>
                    <td className="p-3">{d.type}</td>
                    <td className="p-3">{d.quantity}</td>
                    <td className="p-3">{d.expiry}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        d.status === 'Claimed' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {d.isQuick ? (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Quick</span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Regular</span>
                      )}
                    </td>
                  </tr>
                ))} 
              </tbody>
            </table> 
            {claimedByMe.length === 0 && <p className="text-center text-gray-500 py-4">You have not claimed any donations yet.</p>} 
          </div>
        </div>
      </div>
    ); 
};

const AdminDashboard = () => { 
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [quickDonations, setQuickDonations] = useState([]);
  const [otpCredentials, setOtpCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemType, setItemType] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Extract user name from email (before @ symbol)
  const userName = 'Admin';
  
  // Function to refresh data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    toast.info('Refreshing data...');
  };
  
  // Fetch all data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        
        // Fetch donations
        const donationsSnapshot = await getDocs(collection(db, 'donations'));
        const donationsData = donationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDonations(donationsData);
        
        // Fetch quick donations
        const quickDonationsSnapshot = await getDocs(collection(db, 'quickDonations'));
        const quickDonationsData = quickDonationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuickDonations(quickDonationsData);
        
        // Fetch OTP credentials
        const otpSnapshot = await getDocs(collection(db, 'otpCredentials'));
        const otpData = otpSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOtpCredentials(otpData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Error fetching data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [refreshKey]);
  
  // Calculate statistics
  const donorCount = users.filter(user => user.role === 'donor').length;
  const ngoCount = users.filter(user => user.role === 'ngo').length;
  const adminCount = users.filter(user => user.role === 'admin').length;
  
  const allDonations = [
    ...donations.map(d => ({ ...d, isQuick: false })),
    ...quickDonations.map(d => ({ ...d, isQuick: true }))
  ];
  
  const availableDonations = allDonations.filter(d => d.status === 'Available').length;
  const claimedDonations = allDonations.filter(d => d.status === 'Claimed').length;
  
  // Prepare chart data
  const userDistributionData = {
    labels: ['Donors', 'NGOs', 'Admins'],
    datasets: [
      {
        data: [donorCount, ngoCount, adminCount],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const donationStatusData = {
    labels: ['Available', 'Claimed'],
    datasets: [
      {
        data: [availableDonations, claimedDonations],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare donations over time data
  const months = [];
  const counts = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = allDonations.filter(d => {
      const createdAt = d.createdAt?.toDate();
      return createdAt >= month && createdAt < nextMonth;
    }).length;
    months.push(month.toLocaleString('default', { month: 'short', year: 'numeric' }));
    counts.push(count);
  }
  
  const donationsOverTimeData = {
    labels: months,
    datasets: [
      {
        label: 'Donations',
        data: counts,
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Handle delete action
  const handleDelete = async () => {
    if (!itemToDelete || !itemType) return;
    
    try {
      if (itemType === 'user') {
        await deleteDoc(doc(db, 'users', itemToDelete));
        setUsers(users.filter(user => user.id !== itemToDelete));
      } else if (itemType === 'donation') {
        await deleteDoc(doc(db, 'donations', itemToDelete));
        setDonations(donations.filter(donation => donation.id !== itemToDelete));
      } else if (itemType === 'quickDonation') {
        await deleteDoc(doc(db, 'quickDonations', itemToDelete));
        setQuickDonations(quickDonations.filter(donation => donation.id !== itemToDelete));
      } else if (itemType === 'otpCredential') {
        await deleteDoc(doc(db, 'otpCredentials', itemToDelete));
        setOtpCredentials(otpCredentials.filter(otp => otp.id !== itemToDelete));
      }
      
      toast.success(t('adminDeleteSuccess'));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setItemType('');
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(t('adminDeleteError'));
    }
  };
  
  // Render the appropriate content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
          <span className="text-lg">Loading data...</span>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-700">{t('adminUsers')}</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{users.length}</p>
                <div className="mt-4 text-sm text-indigo-600">
                  <div className="flex justify-between">
                    <span>{t('adminDonors')}:</span>
                    <span className="font-semibold">{donorCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('adminNgos')}:</span>
                    <span className="font-semibold">{ngoCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('roleAdmin')}:</span>
                    <span className="font-semibold">{adminCount}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-md border border-green-100">
                <h3 className="text-lg font-semibold text-green-700">{t('adminDonations')}</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{allDonations.length}</p>
                <div className="mt-4 text-sm text-green-600">
                  <div className="flex justify-between">
                    <span>{t('adminAvailable')}:</span>
                    <span className="font-semibold">{availableDonations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('adminClaimed')}:</span>
                    <span className="font-semibold">{claimedDonations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick Donations:</span>
                    <span className="font-semibold">{quickDonations.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-md border border-yellow-100">
                <h3 className="text-lg font-semibold text-yellow-700">{t('adminTotalFood')}</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">10,000+ kg</p>
                <div className="mt-4 text-sm text-yellow-600">
                  <p>Estimated food saved from waste</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-md border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-700">Impact</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">5,000+</p>
                <div className="mt-4 text-sm text-purple-600">
                  <p>People fed through donations</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">{t('adminRecentActivity')}</h2>
              <div className="space-y-4">
                {allDonations.slice(0, 5).map(donation => (
                  <div key={donation.id} className="flex items-center justify-between p-3 border-b">
                    <div>
                      <p className="font-medium">{donation.type} - {donation.quantity}</p>
                      <p className="text-sm text-gray-500">by {donation.donor || donation.donorName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        donation.status === 'Available' ? 'bg-green-100 text-green-800' : 
                        donation.status === 'Claimed' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {donation.status}
                      </span>
                      {donation.isQuick && (
                        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Quick</span>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {donation.createdAt && new Date(donation.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {allDonations.length === 0 && <p className="text-center text-gray-500 py-4">{t('adminNoDonations')}</p>}
              </div>
            </div>
          </div>
        );
        
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">{t('adminEmail')}</th>
                    <th className="p-3">{t('adminRole')}</th>
                    <th className="p-3">{t('adminStatus')}</th>
                    <th className="p-3">{t('adminCreatedAt')}</th>
                    <th className="p-3">{t('adminActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'donor' ? 'bg-blue-100 text-blue-800' : 
                          user.role === 'ngo' ? 'bg-green-100 text-green-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.active === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.active === false ? t('adminInactive') : t('adminActive')}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.createdAt && new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedItem(user)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => {
                              setItemToDelete(user.id);
                              setItemType('user');
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center text-gray-500 py-4">{t('adminNoUsers')}</p>}
            </div>
          </div>
        );
        
      case 'donations':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-indigo-50">
                  <h3 className="text-lg font-semibold text-indigo-700">Regular Donations</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3">{t('adminFoodType')}</th>
                        <th className="p-3">{t('adminQuantity')}</th>
                        <th className="p-3">{t('adminDonor')}</th>
                        <th className="p-3">{t('adminStatus')}</th>
                        <th className="p-3">{t('adminActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map(donation => (
                        <tr key={donation.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{donation.type}</td>
                          <td className="p-3">{donation.quantity}</td>
                          <td className="p-3">{donation.donor}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              donation.status === 'Available' ? 'bg-green-100 text-green-800' : 
                              donation.status === 'Claimed' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setSelectedItem(donation)}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <FaEye />
                              </button>
                              <button 
                                onClick={() => {
                                  setItemToDelete(donation.id);
                                  setItemType('donation');
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {donations.length === 0 && <p className="text-center text-gray-500 py-4">No regular donations found</p>}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-yellow-50">
                  <h3 className="text-lg font-semibold text-yellow-700">Quick Donations</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3">{t('adminFoodType')}</th>
                        <th className="p-3">{t('adminQuantity')}</th>
                        <th className="p-3">Donor Name</th>
                        <th className="p-3">{t('adminStatus')}</th>
                        <th className="p-3">{t('adminActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickDonations.map(donation => (
                        <tr key={donation.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{donation.type}</td>
                          <td className="p-3">{donation.quantity}</td>
                          <td className="p-3">{donation.donorName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              donation.status === 'Available' ? 'bg-green-100 text-green-800' : 
                              donation.status === 'Claimed' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setSelectedItem(donation)}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <FaEye />
                              </button>
                              <button 
                                onClick={() => {
                                  setItemToDelete(donation.id);
                                  setItemType('quickDonation');
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {quickDonations.length === 0 && <p className="text-center text-gray-500 py-4">No quick donations found</p>}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'statistics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaChartPie className="mr-2" />
                  {t('adminUserDistribution')}
                </h3>
                <div className="h-64">
                  <Pie data={userDistributionData} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaChartPie className="mr-2" />
                  {t('adminDonationStatus')}
                </h3>
                <div className="h-64">
                  <Pie data={donationStatusData} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaChartBar className="mr-2" />
                  {t('adminDonationsOverTime')}
                </h3>
                <div className="h-64">
                  <Bar data={donationsOverTimeData} />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'otp':
        return (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-indigo-50">
              <h3 className="text-lg font-semibold text-indigo-700">{t('adminOtpCredentials')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">{t('adminOtpEmail')}</th>
                    <th className="p-3">{t('adminOtpCode')}</th>
                    <th className="p-3">{t('adminOtpCreatedAt')}</th>
                    <th className="p-3">{t('adminOtpUsed')}</th>
                    <th className="p-3">{t('adminActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {otpCredentials.map(otp => (
                    <tr key={otp.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{otp.email}</td>
                      <td className="p-3">{otp.otp}</td>
                      <td className="p-3">
                        {otp.createdAt && new Date(otp.createdAt.seconds * 1000).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          otp.used ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {otp.used ? t('adminOtpYes') : t('adminOtpNo')}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedItem(otp)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => {
                              setItemToDelete(otp.id);
                              setItemType('otpCredential');
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {otpCredentials.length === 0 && <p className="text-center text-gray-500 py-4">No OTP credentials found</p>}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mr-4">
            <FaUser className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('welcomeAdmin')}</h1>
            <p className="text-gray-600">{userName}</p>
          </div>
        </div>
        <button 
          onClick={refreshData} 
          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors duration-300 flex items-center"
        >
          <FaSync className="mr-2" />
          {t('adminRefresh')}
        </button>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('adminOverview')}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('adminUserManagement')}
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'donations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('adminDonationManagement')}
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('adminStatistics')}
            </button>
            <button
              onClick={() => setActiveTab('otp')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'otp'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('adminOtpCredentials')}
            </button>
          </nav>
        </div>
      </div>
      
      {renderContent()}
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all animate-fade-in-up">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeTab === 'users' ? t('adminUserDetails') : 
                   activeTab === 'otp' ? t('adminOtpDetails') : t('adminDonationDetails')}
                </h2>
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  <FaTimes />
                </button>
              </div>
              
              {activeTab === 'users' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('adminEmail')}</p>
                      <p className="font-medium">{selectedItem.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminRole')}</p>
                      <p className="font-medium">{selectedItem.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminStatus')}</p>
                      <p className="font-medium">{selectedItem.active !== false ? t('adminActive') : t('adminInactive')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminCreatedAt')}</p>
                      <p className="font-medium">
                        {selectedItem.createdAt && new Date(selectedItem.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'otp' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('adminOtpEmail')}</p>
                      <p className="font-medium">{selectedItem.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminOtpCode')}</p>
                      <p className="font-medium">{selectedItem.otp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminOtpCreatedAt')}</p>
                      <p className="font-medium">
                        {selectedItem.createdAt && new Date(selectedItem.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminOtpUsed')}</p>
                      <p className="font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedItem.used ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedItem.used ? t('adminOtpYes') : t('adminOtpNo')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('adminFoodType')}</p>
                      <p className="font-medium">{selectedItem.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminQuantity')}</p>
                      <p className="font-medium">{selectedItem.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Donor</p>
                      <p className="font-medium">{selectedItem.donor || selectedItem.donorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminExpiry')}</p>
                      <p className="font-medium">{selectedItem.expiry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('adminStatus')}</p>
                      <p className="font-medium">{selectedItem.status}</p>
                    </div>
                    {selectedItem.claimedBy && (
                      <div>
                        <p className="text-sm text-gray-500">{t('adminClaimedBy')}</p>
                        <p className="font-medium">
                          {users.find(u => u.id === selectedItem.claimedBy)?.email || 'Unknown'}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">{t('adminCreatedAt')}</p>
                      <p className="font-medium">
                        {selectedItem.createdAt && new Date(selectedItem.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                    {selectedItem.claimedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Claimed At</p>
                        <p className="font-medium">
                          {new Date(selectedItem.claimedAt.seconds * 1000).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedItem.isQuick && (
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Quick Donation</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedItem.donorImage && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Image</p>
                      <Image 
                        src={selectedItem.donorImage} 
                        alt={selectedItem.type} 
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg" 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fade-in-up">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">{t('adminConfirmDelete')}</p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DonationForm = ({ setPage, user }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ 
      foodType: '', 
      quantity: '', 
      expiry: '', 
      address: '' 
    }); 
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    
    const handleInputChange = (e) => { 
      const { id, value } = e.target; 
      setFormData(prev => ({ ...prev, [id]: value })); 
    };
    
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true); 
        setSubmitStatus(null);
        
        try {
            await addDoc(collection(db, 'donations'), {
                donor: user.email, 
                donorId: user.uid, 
                type: formData.foodType, 
                quantity: formData.quantity, 
                expiry: formData.expiry, 
                address: formData.address,
                location: { lat: 19.0760, lng: 72.8777 }, 
                status: 'Available',
                donorImage: imagePreview || null,
                createdAt: serverTimestamp(),
            });
            setIsSubmitting(false); 
            setSubmitStatus('success');
            toast.success('Donation submitted successfully!');
            setTimeout(() => { 
              setPage('donorDashboard'); 
            }, 2500);
        } catch (error) { 
            console.error("Error adding document: ", error); 
            setIsSubmitting(false); 
            setSubmitStatus('error');
            toast.error('Error submitting donation. Please try again.');
        }
    };
    
    return ( 
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('createDonationTitle')}</h1>
            {submitStatus === 'success' ? ( 
              <div className="text-center py-10">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-gray-800">{t('donationSuccessHeader')}</h2>
                <p className="mt-2 text-gray-600">{t('donationSuccessText')}</p>
              </div>
            ) : ( 
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">
                    {t('foodTypeLabel')}
                  </label>
                  <input 
                    type="text" 
                    id="foodType" 
                    value={formData.foodType} 
                    onChange={handleInputChange} 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                    placeholder={t('foodTypePlaceholder')} 
                  />
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    {t('quantityLabel')}
                  </label>
                  <input 
                    type="text" 
                    id="quantity" 
                    value={formData.quantity} 
                    onChange={handleInputChange} 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                    placeholder={t('quantityPlaceholder')} 
                  />
                </div>
                
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                    {t('expiryLabel')}
                  </label>
                  <input 
                    type="date" 
                    id="expiry" 
                    value={formData.expiry} 
                    onChange={handleInputChange} 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    {t('addressLabel')}
                  </label>
                  <textarea 
                    id="address" 
                    rows="3" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300" 
                    placeholder={t('addressPlaceholder')}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('uploadLabel')}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors duration-300 bg-gray-50">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="flex flex-col items-center">
                          <Image 
                            src={imagePreview} 
                            alt="Preview" 
                            width={128}
                            height={128}
                            className="h-32 w-32 object-cover rounded-lg mb-2" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setImagePreview(null)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                              <span>{t('uploadButton')}</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                            <p className="pl-1">{t('uploadDragDrop')}</p>
                          </div>
                          <p className="text-xs text-gray-500">{t('uploadHint')}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button 
                    type="button" 
                    onClick={() => setPage('donorDashboard')} 
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center disabled:bg-indigo-400 transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting && <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                    {isSubmitting ? t('submittingDonation') : t('submitDonation')}
                  </button>
                </div>
              </form>
            )} 
          </div>
        </div>
      </div>
    ); 
};

const AboutPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">{t('aboutTitle')}</h1>
        <p className="text-xl text-center text-gray-600 mb-12">{t('aboutSubtitle')}</p>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <Image 
                src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80" 
                alt="About FoodSave" 
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                {t('aboutContent')}
              </p>
              <p className="text-gray-600 mb-6">
                Founded in 2023, FoodSave has already helped redistribute over 10,000 meals to those in need across Mumbai. 
                Our platform connects restaurants, supermarkets, and individuals with local NGOs and shelters to ensure that 
                surplus food reaches people who need it most.
              </p>
              <div className="flex space-x-4">
                <div className="bg-indigo-50 p-4 rounded-lg flex-1">
                  <h3 className="font-bold text-indigo-700">10,000+</h3>
                  <p className="text-sm text-gray-600">Meals Saved</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg flex-1">
                  <h3 className="font-bold text-green-700">50+</h3>
                  <p className="text-sm text-gray-600">Partner NGOs</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg flex-1">
                  <h3 className="font-bold text-yellow-700">200+</h3>
                  <p className="text-sm text-gray-600">Food Donors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-indigo-100">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Community Impact</h3>
            <p className="text-gray-600">Building stronger communities through food sharing and reducing waste.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-green-100">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Sustainability</h3>
            <p className="text-gray-600">Reducing food waste and environmental impact through smart redistribution.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-yellow-100">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Partnership</h3>
            <p className="text-gray-600">Connecting donors, NGOs, and volunteers to create a sustainable food ecosystem.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">{t('contactTitle')}</h1>
        <p className="text-xl text-center text-gray-600 mb-12">{t('contactSubtitle')}</p>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="mb-6">
                {t('contactContent')}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Phone</h3>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Email</h3>
                    <p>contact@foodsave.org</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Address</h3>
                    <p>123 Community Center, Mumbai, Maharashtra 400001</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-bold mb-3">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-white text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-colors duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                    </svg>
                  </a>
                  <a href="#" className="bg-white text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-colors duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="bg-white text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-colors duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.948-.069zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                    placeholder="How can we help?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => { 
  const { t } = useTranslation();
  return ( 
    <footer className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <FaUtensils className="mr-2" />
              FoodSave
            </h3>
            <p className="text-indigo-200">Reducing food waste and fighting hunger in Mumbai.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Quick Links</h3>
            <ul className="space-y-2 text-indigo-200">
              <li><a href="#" className="hover:text-white transition-colors duration-300">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-indigo-200 hover:text-white transition-colors duration-300">Facebook</a>
              <a href="#" className="text-indigo-200 hover:text-white transition-colors duration-300">Twitter</a>
              <a href="#" className="text-indigo-200 hover:text-white transition-colors duration-300">Instagram</a>
            </div>
          </div>
        </div>
        <div className="text-center text-indigo-300 mt-8 border-t border-indigo-700 pt-4">
          &copy; {new Date().getFullYear()} FoodSave. All rights reserved.
        </div>
      </div>
    </footer>
  ); 
};

// === MAIN APP COMPONENT ===
export default function App() {
    const [page, setPage] = useState('home');
    const [user, setUser] = useState(null);
    const [donations, setDonations] = useState(null);
    const [quickDonations, setQuickDonations] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Function to refresh data without reloading the page
    const refreshData = () => {
      setRefreshKey(prev => prev + 1);
      toast.info('Refreshing data...');
    };

    useEffect(() => {
        setIsAuthLoading(true);
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setUser({ uid: currentUser.uid, email: currentUser.email, ...userDoc.data() });
                } else {
                    setUser({ uid: currentUser.uid, email: currentUser.email, role: 'donor' }); 
                }
            } else {
                setUser(null);
            }
            setIsAuthLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (user) {
            // Fetch regular donations
            const q = query(collection(db, "donations"));
            const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
                const donationsData = [];
                querySnapshot.forEach((doc) => {
                    donationsData.push({ id: doc.id, ...doc.data() });
                });
                setDonations(donationsData);
            });
            
            // Fetch quick donations
            const qQuick = query(collection(db, "quickDonations"));
            const unsubscribeQuick = onSnapshot(qQuick, (querySnapshot) => {
                const quickDonationsData = [];
                querySnapshot.forEach((doc) => {
                    quickDonationsData.push({ id: doc.id, ...doc.data() });
                });
                setQuickDonations(quickDonationsData);
            });
            
            return () => {
                unsubscribeFirestore();
                unsubscribeQuick();
            };
        } else {
            setDonations([]);
            setQuickDonations([]);
        }
    }, [user, refreshKey]);

    const renderPage = () => {
        if (isAuthLoading) {
            return <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div> 
              <span className="text-xl ml-4">Loading App...</span>
            </div>;
        }
        
        switch (page) {
            case 'home': return <HomePage setPage={setPage} user={user} />;
            case 'about': return <AboutPage />;
            case 'contact': return <ContactPage />;
            case 'listings': return user ? <ListingsPage donations={donations} quickDonations={quickDonations} user={user} /> : <Login setUser={setUser} setPage={setPage} />;
            case 'login': return <Login setUser={setUser} setPage={setPage} />;
            case 'donorDashboard': return user?.role === 'donor' ? <DonorDashboard user={user} donations={donations} refreshData={refreshData} /> : <Login setUser={setUser} setPage={setPage} />;
            case 'ngoDashboard': return user?.role === 'ngo' ? <NGODashboard donations={donations} quickDonations={quickDonations} user={user} refreshData={refreshData} /> : <Login setUser={setUser} setPage={setPage} />;
            case 'adminDashboard': return user?.role === 'admin' ? <AdminDashboard /> : <Login setUser={setUser} setPage={setPage} />;
            case 'donationForm': return user?.role === 'donor' ? <DonationForm setPage={setPage} user={user} /> : <Login setUser={setUser} setPage={setPage} />;
            default: return <HomePage setPage={setPage} user={user} />;
        }
    };

    return (
        <LanguageProvider>
          <div className="flex flex-col min-h-screen font-sans bg-gray-50" style={{ willChange: 'transform' }}>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnHover
              draggable
              theme="colored"
            />
            <style jsx global>{`
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
              }
              .animate-fade-in-up {
                animation: fade-in-up 0.5s ease-out forwards;
              }
              @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
              }
              .animate-blob {
                animation: blob 7s infinite;
              }
              .animation-delay-2000 {
                animation-delay: 2s;
              }
              .animation-delay-4000 {
                animation-delay: 4s;
              }
            `}</style>
            <div className="flex-grow">
                <Header setPage={setPage} user={user} setUser={setUser} />
                {renderPage()}
            </div>
            <Footer />
          </div>
        </LanguageProvider>
    );
}