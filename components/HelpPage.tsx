"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, MessageCircle, Mail, Phone, Book, Video, Users, Settings, CreditCard, Shield, LucideIcon } from 'lucide-react';

// Define interfaces for better type safety
interface HelpCategory {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface FAQ {
  question: string;
  answer: string;
}

interface FAQData {
  [key: string]: FAQ[];
}

interface ContactMethod {
  icon: LucideIcon;
  title: string;
  description: string;
  action: string;
  available: string;
}

const HelpPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const helpCategories: HelpCategory[] = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'courses', label: 'Courses & Learning', icon: Video },
    { id: 'account', label: 'Account Management', icon: Users },
    { id: 'technical', label: 'Technical Support', icon: Settings },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const faqData: FAQData = {
    'getting-started': [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top right corner, fill in your details, and verify your email address. You can also sign up using your Google or LinkedIn account for faster registration.'
      },
      {
        question: 'How do I navigate the platform?',
        answer: 'Use the main navigation menu to access your dashboard, browse courses, view your progress, and manage your profile. The search bar at the top helps you find specific courses or topics quickly.'
      },
      {
        question: 'What are learning paths?',
        answer: 'Learning paths are curated sequences of courses designed to help you master specific skills or topics. They provide a structured approach to learning with recommended progression.'
      },
      {
        question: 'How do I track my progress?',
        answer: 'Visit your dashboard to see completion percentages, certificates earned, and time spent learning. Each course also shows individual lesson progress and quiz scores.'
      }
    ],
    'courses': [
      {
        question: 'How do I enroll in a course?',
        answer: 'Browse our course catalog, click on a course that interests you, and click the "Enroll Now" button. Free courses are immediately accessible, while premium courses require payment.'
      },
      {
        question: 'Can I download course materials?',
        answer: 'Yes, most courses offer downloadable resources like PDFs, slides, and supplementary materials. Look for the download icon next to each resource.'
      },
      {
        question: 'How do I access course videos offline?',
        answer: 'Our mobile app allows you to download videos for offline viewing. Simply tap the download button next to any video lesson in the app.'
      },
      {
        question: 'What if I get stuck on a lesson?',
        answer: 'Use the discussion forum for each course to ask questions, or contact our support team. Many courses also have community study groups you can join.'
      }
    ],
    'account': [
      {
        question: 'How do I update my profile information?',
        answer: 'Go to Settings > Profile to update your personal information, profile picture, and learning preferences. Changes are saved automatically.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email we send you.'
      },
      {
        question: 'Can I change my email address?',
        answer: 'Yes, go to Settings > Account Security to change your email address. You\'ll need to verify the new email address before the change takes effect.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact our support team to request account deletion. Please note that this action is irreversible and will remove all your progress and certificates.'
      }
    ],
    'technical': [
      {
        question: 'What browsers are supported?',
        answer: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome with hardware acceleration enabled.'
      },
      {
        question: 'Why are videos not playing?',
        answer: 'Check your internet connection, disable ad blockers, and ensure your browser is up to date. If issues persist, try clearing your browser cache or switching to incognito mode.'
      },
      {
        question: 'The platform is loading slowly. What can I do?',
        answer: 'This might be due to your internet connection or browser cache. Try refreshing the page, clearing your cache, or switching to a different network if possible.'
      },
      {
        question: 'How do I report a bug?',
        answer: 'Use the "Report Issue" button in the help menu, or email us at support@nextlearn.com with details about the problem and your browser/device information.'
      }
    ],
    'billing': [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment partners.'
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'Go to Settings > Billing and click "Cancel Subscription". You\'ll retain access to premium content until the end of your current billing period.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'We offer a 30-day money-back guarantee for all subscriptions. Individual course purchases can be refunded within 7 days if you\'ve completed less than 20% of the content.'
      },
      {
        question: 'How do I update my payment information?',
        answer: 'Visit Settings > Billing to update your credit card information, billing address, or change your payment method.'
      }
    ],
    'privacy': [
      {
        question: 'How is my data protected?',
        answer: 'We use industry-standard encryption to protect your data both in transit and at rest. Our servers are hosted on secure cloud infrastructure with regular security audits.'
      },
      {
        question: 'Do you share my personal information?',
        answer: 'We never sell your personal information. We only share data with trusted partners as outlined in our Privacy Policy, and only to provide you with our services.'
      },
      {
        question: 'Can I export my learning data?',
        answer: 'Yes, you can request a complete export of your learning data, including progress, certificates, and account information from Settings > Privacy.'
      },
      {
        question: 'How do I manage cookie preferences?',
        answer: 'Click the cookie preferences link in the footer to manage which cookies you allow. You can also disable cookies in your browser settings.'
      }
    ]
  };

  const contactMethods: ContactMethod[] = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      available: 'Available 24/7'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'Send Email',
      available: 'Response within 2 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with a specialist',
      action: 'Call Now',
      available: 'Mon-Fri 9AM-6PM'
    }
  ];

  const filteredFAQs = faqData[activeCategory]?.filter((faq: FAQ) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to your questions, learn how to use our platform, or get in touch with our support team
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 bg-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Help Topics</h2>
              <nav className="space-y-2">
                {helpCategories.map((category: HelpCategory) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {helpCategories.find((cat: HelpCategory) => cat.id === activeCategory)?.label}
                </h2>
                <p className="text-gray-600">
                  Frequently asked questions and helpful information
                </p>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                {filteredFAQs.map((faq: FAQ, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                  <p className="text-sm text-gray-400 mt-2">Try different keywords or browse our help categories</p>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Still need help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactMethods.map((method: ContactMethod, index: number) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                      <p className="text-xs text-gray-500 mb-4">{method.available}</p>
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        {method.action}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;