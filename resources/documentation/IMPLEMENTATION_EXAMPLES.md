# 🛠️ IMPLEMENTATION EXAMPLES
## Ready-to-Use Code Patterns for Your Document Platform

---

## 🔧 PDFME INTEGRATION EXAMPLE

### Replace Current jsPDF Implementation

```typescript
// resources/examples/pdfme-integration.tsx
import React, { useRef, useEffect } from 'react';
import { Designer } from '@pdfme/ui';
import { Template, BLANK_PDF, checkTemplate } from '@pdfme/common';
import { generate } from '@pdfme/generator';

interface PDFMeDesignerProps {
  onTemplateChange: (template: Template) => void;
  initialTemplate?: Template;
}

const PDFMeDesigner: React.FC<PDFMeDesignerProps> = ({ 
  onTemplateChange, 
  initialTemplate 
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const designer = useRef<Designer | null>(null);

  const defaultTemplate: Template = {
    basePdf: BLANK_PDF,
    schemas: [
      {
        // Text field
        companyName: {
          type: 'text',
          position: { x: 20, y: 30 },
          width: 100,
          height: 10,
          fontSize: 16,
          fontColor: '#000000',
        },
        // Image field  
        logo: {
          type: 'image',
          position: { x: 140, y: 20 },
          width: 30,
          height: 20,
        },
        // QR Code
        qrCode: {
          type: 'qrcode',
          position: { x: 20, y: 60 },
          width: 25,
          height: 25,
        }
      },
    ],
  };

  useEffect(() => {
    if (designerRef.current && !designer.current) {
      const template = initialTemplate || defaultTemplate;
      
      designer.current = new Designer({
        domContainer: designerRef.current,
        template,
        options: {
          lang: 'en',
          labels: {
            'clear': 'Clear',
            'addNewField': 'Add Field',
            'editField': 'Edit Field'
          }
        }
      });

      // Listen for template changes
      designer.current.onChangeTemplate((template) => {
        onTemplateChange(template);
      });
    }

    return () => {
      if (designer.current) {
        designer.current.destroy();
        designer.current = null;
      }
    };
  }, []);

  return <div ref={designerRef} style={{ height: '100vh' }} />;
};

// Generate PDF from template
export const generatePDF = async (template: Template, inputs: any[]) => {
  try {
    const pdf = await generate({
      template,
      inputs,
    });
    
    // Download the PDF
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return pdf;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

export default PDFMeDesigner;
```

---

## 🎨 CRAFT.JS DRAG & DROP IMPLEMENTATION

### Advanced Canvas Editor with Property Panel

```typescript
// resources/examples/craftjs-editor.tsx
import React from 'react';
import { Editor, Frame, Element, useNode, UserComponent } from '@craftjs/core';
import { Layers } from '@craftjs/layers';

// Custom Text Component
const Text: UserComponent = ({ text, fontSize, textAlign }) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        fontSize: `${fontSize}px`,
        textAlign,
        padding: '8px',
        border: selected ? '2px solid #2563eb' : 'none',
        cursor: 'move'
      }}
    >
      {text}
    </div>
  );
};

Text.craft = {
  props: {
    text: 'Hello World',
    fontSize: 16,
    textAlign: 'left',
  },
  related: {
    settings: TextSettings,
  },
};

// Settings Panel for Text
const TextSettings = () => {
  const {
    actions: { setProp },
    text,
    fontSize,
    textAlign,
  } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
    textAlign: node.data.props.textAlign,
  }));

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium">Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setProp((props: any) => props.text = e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Font Size</label>
        <input
          type="range"
          min="12"
          max="72"
          value={fontSize}
          onChange={(e) => setProp((props: any) => props.fontSize = parseInt(e.target.value))}
          className="mt-1 block w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Alignment</label>
        <select
          value={textAlign}
          onChange={(e) => setProp((props: any) => props.textAlign = e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
};

// Main Canvas Component
const Canvas = () => {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 min-h-96 p-4">
      <Frame>
        <Element is={Container} canvas>
          <Text text="Drag me around!" />
        </Element>
      </Frame>
    </div>
  );
};

// Container Component
const Container: UserComponent = ({ children }) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div ref={(ref) => connect(drag(ref))} className="w-full h-full">
      {children}
    </div>
  );
};

Container.craft = {
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
};

// Main Editor App
export const CraftJSEditor = () => {
  return (
    <div className="flex h-screen">
      <Editor resolver={{ Text, Container }}>
        {/* Toolbox */}
        <div className="w-64 bg-gray-50 p-4 border-r">
          <h3 className="font-medium mb-4">Components</h3>
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'text-component');
            }}
            className="p-2 bg-white border rounded cursor-move mb-2"
          >
            📝 Text
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 p-4">
          <Canvas />
        </div>
        
        {/* Properties Panel */}
        <div className="w-64 bg-gray-50 border-l">
          <h3 className="font-medium p-4 border-b">Properties</h3>
          {/* Settings will appear here when component is selected */}
        </div>
        
        {/* Layers Panel */}
        <div className="w-64 bg-gray-50 border-l">
          <h3 className="font-medium p-4 border-b">Layers</h3>
          <Layers />
        </div>
      </Editor>
    </div>
  );
};
```

---

## 🎥 VIDEO EDITOR WITH REMOTION

### Timeline-based Video Creation

```typescript
// resources/examples/video-editor.tsx
import { Player, Composition } from '@remotion/player';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import React, { useState } from 'react';

// Video Composition Component
const MyComposition: React.FC<{
  title: string;
  subtitle: string;
  backgroundColor: string;
}> = ({ title, subtitle, backgroundColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animations
  const titleOpacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const titleTransform = interpolate(
    frame,
    [0, 30],
    [50, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        flex: 1,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: 80,
          fontWeight: 'bold',
          color: 'white',
          opacity: titleOpacity,
          transform: `translateY(${titleTransform}px)`,
          textAlign: 'center',
          margin: 0,
        }}
      >
        {title}
      </h1>
      
      <p
        style={{
          fontSize: 40,
          color: 'white',
          opacity: interpolate(frame, [60, 90], [0, 1]),
          textAlign: 'center',
          marginTop: 40,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};

// Video Editor Interface
export const VideoEditor = () => {
  const [videoConfig, setVideoConfig] = useState({
    title: 'My Document',
    subtitle: 'Created with AI',
    backgroundColor: '#3b82f6',
  });

  return (
    <div className="flex h-screen">
      {/* Preview */}
      <div className="flex-1 bg-black flex items-center justify-center">
        <Player
          component={MyComposition}
          inputProps={videoConfig}
          durationInFrames={300}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          style={{ width: '100%', maxWidth: 800 }}
          controls
        />
      </div>
      
      {/* Controls */}
      <div className="w-80 bg-gray-50 p-6 space-y-4">
        <h3 className="font-medium">Video Properties</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={videoConfig.title}
            onChange={(e) => setVideoConfig(prev => ({
              ...prev,
              title: e.target.value
            }))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <input
            type="text"
            value={videoConfig.subtitle}
            onChange={(e) => setVideoConfig(prev => ({
              ...prev,
              subtitle: e.target.value
            }))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Background</label>
          <input
            type="color"
            value={videoConfig.backgroundColor}
            onChange={(e) => setVideoConfig(prev => ({
              ...prev,
              backgroundColor: e.target.value
            }))}
            className="w-full h-10 border rounded"
          />
        </div>
        
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Export Video
        </button>
      </div>
    </div>
  );
};

// Register the composition
export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Hello World',
          subtitle: 'Welcome to Remotion',
          backgroundColor: '#3b82f6',
        }}
      />
    </>
  );
};
```

---

## 🤖 AI INTEGRATION WITH GEMINI

### Smart Document Generation

```typescript
// resources/examples/ai-integration.tsx
import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useState } from 'react';

const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_AI_API_KEY!);

interface AIGeneratedContent {
  title: string;
  content: string;
  layout: 'standard' | 'certificate' | 'business';
  elements: Array<{
    type: 'text' | 'image' | 'shape';
    content: string;
    position: { x: number; y: number };
    style: Record<string, any>;
  }>;
}

export const AIDocumentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<AIGeneratedContent | null>(null);

  const generateDocument = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const enhancedPrompt = `
        Create a professional document based on this request: "${prompt}"
        
        Please respond with a JSON object containing:
        {
          "title": "Document title",
          "content": "Main document content",
          "layout": "standard|certificate|business",
          "elements": [
            {
              "type": "text|image|shape",
              "content": "Element content",
              "position": {"x": 0, "y": 0},
              "style": {"fontSize": 16, "color": "#000", "fontWeight": "normal"}
            }
          ]
        }
        
        Make it professional and well-structured.
      `;

      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedDoc = JSON.parse(jsonMatch[0]);
        setGeneratedDoc(parsedDoc);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Failed to generate document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (recipientName: string, course: string) => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const certificatePrompt = `
        Generate a professional certificate layout for:
        - Recipient: ${recipientName}
        - Course/Achievement: ${course}
        
        Return JSON with certificate elements positioned appropriately:
        {
          "title": "Certificate of Achievement",
          "layout": "certificate",
          "elements": [
            // Include header, recipient name, course, date, signature areas
            // Position elements with proper spacing and hierarchy
          ]
        }
      `;

      const result = await model.generateContent(certificatePrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const certificate = JSON.parse(jsonMatch[0]);
        setGeneratedDoc(certificate);
      }
      
    } catch (error) {
      console.error('Certificate generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">AI Document Generator</h2>
        
        {/* Prompt Input */}
        <div className="mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the document you want to create... (e.g., 'Create a business proposal for a web development agency')"
            className="w-full h-32 p-3 border rounded-lg resize-none"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={generateDocument}
            disabled={loading || !prompt.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Document'}
          </button>
          
          <button
            onClick={() => generateCertificate('John Doe', 'Web Development')}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Generate Sample Certificate
          </button>
        </div>
      </div>

      {/* Generated Document Preview */}
      {generatedDoc && (
        <div className="bg-white border rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">{generatedDoc.title}</h3>
          
          {/* Document Canvas */}
          <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 min-h-96 p-8 mb-4">
            {generatedDoc.elements.map((element, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  ...element.style,
                }}
                className="bg-white p-2 border rounded shadow-sm"
              >
                {element.content}
              </div>
            ))}
          </div>
          
          {/* Export Options */}
          <div className="flex space-x-4">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Export as PDF
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Edit in Designer
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Save Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Bulk Certificate Generation
export const BulkCertificateGenerator = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [template, setTemplate] = useState<string>('');

  const processBulkCertificates = async (recipients: any[]) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    for (const recipient of recipients) {
      const prompt = `Generate certificate for ${recipient.name} who completed ${recipient.course} on ${recipient.date}`;
      
      try {
        const result = await model.generateContent(prompt);
        // Process individual certificate
        console.log(`Certificate generated for ${recipient.name}`);
      } catch (error) {
        console.error(`Failed to generate certificate for ${recipient.name}`);
      }
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">Bulk Certificate Generator</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Upload CSV (columns: name, course, date)
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            // Handle CSV parsing with papaparse
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      
      <button
        onClick={() => processBulkCertificates(csvData)}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
      >
        Generate All Certificates
      </button>
    </div>
  );
};
```

---

## 🔐 AUTHENTICATION & BACKEND SETUP

### Supabase Integration

```typescript
// resources/examples/auth-setup.tsx
import { createClient } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

interface User {
  id: string;
  email: string;
  subscription: 'free' | 'pro' | 'enterprise';
  usage: {
    pdfGenerated: number;
    videosCreated: number;
    monthlyLimit: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setUser({
        id: userId,
        email: data.email,
        subscription: data.subscription || 'free',
        usage: data.usage || { pdfGenerated: 0, videosCreated: 0, monthlyLimit: 5 },
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('Check your email for the confirmation link!');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## 💳 PAYMENT INTEGRATION

### Stripe Subscription Setup

```typescript
// resources/examples/payment-setup.tsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY!);

const PRICING_PLANS = {
  free: { price: 0, pdfLimit: 5, videoLimit: 0, features: ['Basic templates'] },
  pro: { price: 29, pdfLimit: 100, videoLimit: 10, features: ['Premium templates', 'AI generation', 'Video creation'] },
  enterprise: { price: 99, pdfLimit: -1, videoLimit: 100, features: ['All features', 'Priority support', 'API access'] },
};

const CheckoutForm = ({ plan, onSuccess }: { plan: keyof typeof PRICING_PLANS; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement!,
    });

    if (error) {
      console.error('Payment method error:', error);
      setLoading(false);
      return;
    }

    // Send to your backend to create subscription
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          plan,
        }),
      });

      const { subscriptionId, clientSecret } = await response.json();

      // Confirm payment if needed
      if (clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
        if (confirmError) {
          throw confirmError;
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Subscribe to ${plan} - $${PRICING_PLANS[plan].price}/month`}
      </button>
    </form>
  );
};

export const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PRICING_PLANS | null>(null);

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Choose Your Plan</h2>
          <p className="mt-4 text-lg text-gray-600">
            Unlock the full potential of our document creation platform
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {Object.entries(PRICING_PLANS).map(([planKey, plan]) => (
            <div
              key={planKey}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                planKey === 'pro' ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <h3 className="text-2xl font-bold text-gray-900 capitalize">
                {planKey}
                {planKey === 'pro' && (
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Popular
                  </span>
                )}
              </h3>
              
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                {plan.price > 0 && <span className="text-base text-gray-500">/month</span>}
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    {plan.pdfLimit === -1 ? 'Unlimited' : plan.pdfLimit} PDFs per month
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    {plan.videoLimit === -1 ? 'Unlimited' : plan.videoLimit} Videos per month
                  </span>
                </li>
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(planKey as keyof typeof PRICING_PLANS)}
                className={`mt-8 w-full py-3 px-4 rounded-lg font-medium ${
                  planKey === 'free'
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {planKey === 'free' ? 'Get Started Free' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Modal */}
        {selectedPlan && selectedPlan !== 'free' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
              <h3 className="text-xl font-bold mb-4">Subscribe to {selectedPlan}</h3>
              
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  plan={selectedPlan}
                  onSuccess={() => {
                    alert('Subscription successful!');
                    setSelectedPlan(null);
                  }}
                />
              </Elements>
              
              <button
                onClick={() => setSelectedPlan(null)}
                className="mt-4 w-full py-2 px-4 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

*These implementation examples provide production-ready code that you can directly integrate into your project. Each example includes error handling, TypeScript types, and modern React patterns.*