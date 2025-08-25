'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Check, RefreshCw, Sparkles, X } from 'lucide-react';
import { PnpTvSparkIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForms } from '@/components/auth-forms';
import { ageGateAi, AgeGateAiInput } from '@/ai/flows/age-gate-ai';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface AgeGateProps {
  onVerified: () => void;
}

type View = 'initial' | 'auth' | 'ai-verify';

const expressions = [
  "a slight, knowing smile",
  "a look of thoughtful understanding",
  "a confident nod",
  "an expression of pleasant surprise",
  "a raised eyebrow of curiosity"
];

export default function AgeGate({ onVerified }: AgeGateProps) {
  const [view, setView] = useState<View>('initial');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [expression] = useState(() => expressions[Math.floor(Math.random() * expressions.length)]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  
  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Could not access your camera. Please check permissions and try again.",
        });
        setView('initial');
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }, []);
  
  useEffect(() => {
    if (view === 'ai-verify' && !isCameraOn) {
      startCamera();
    } else if (view !== 'ai-verify' && isCameraOn) {
      stopCamera();
    }
    // Cleanup on unmount
    return () => stopCamera();
  }, [view, isCameraOn, stopCamera]);


  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const data = canvas.toDataURL('image/jpeg');
        setPhotoData(data);
        stopCamera();
      }
    }
  };

  const handleAiVerify = async () => {
    if (!photoData) return;
    setIsVerifying(true);
    try {
      const input: AgeGateAiInput = {
        photoDataUri: photoData,
        expressionDescription: `The user should have ${expression}. This indicates they have read and understood the terms of service.`
      };
      const result = await ageGateAi(input);
      if (result.isAgeVerified && result.confidence > 0.6) {
        toast({
          title: "Verification Successful!",
          description: "Welcome to PNPtv Spark. You are now being logged in as a guest.",
        });
        onVerified();
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "We couldn't verify your expression. Please try again or use another method.",
        });
        setPhotoData(null);
        startCamera();
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "AI Error",
          description: "An error occurred during verification. Please try again later.",
        });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleShowAuth = (mode: 'login' | 'signup') => {
    if (!agreedToTerms) {
       toast({
        variant: "destructive",
        title: "Terms of Service",
        description: "You must agree to the terms of service to proceed.",
      });
      return;
    }
    setAuthMode(mode);
    setView('auth');
  }

  const renderInitialView = () => (
    <Card className="w-full max-w-md animate-fade-in-up">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <PnpTvSparkIcon className="h-16 w-16" />
        </div>
        <CardTitle className="text-3xl">Welcome to PNPtv Spark</CardTitle>
        <CardDescription>The future of community and content is here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))} />
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the Terms of Service and confirm I am over 18.
            </Label>
        </div>
        <Button size="lg" className="w-full" onClick={() => setView('ai-verify')} disabled={!agreedToTerms}>
          <Sparkles className="mr-2"/> AI Age Verification
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
         <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={() => handleShowAuth('login')}>Log In</Button>
            <Button variant="secondary" onClick={() => handleShowAuth('signup')}>Sign Up</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAiVerifyView = () => (
     <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle>AI Age Verification</CardTitle>
          <CardDescription>To continue, please show us <span className="font-bold text-primary">{expression}</span>.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="aspect-square w-full bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
              {photoData ? (
                <img src={photoData} alt="User snapshot" className="h-full w-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover transform -scale-x-100"></video>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            {isVerifying && <p className="text-center text-primary animate-pulse">Verifying with AI...</p>}
        </CardContent>
        <CardFooter className="flex-col gap-4">
            {photoData ? (
              <div className="flex w-full gap-2">
                <Button variant="outline" className="w-full" onClick={() => { setPhotoData(null); startCamera(); }} disabled={isVerifying}>
                  <RefreshCw /> Retake
                </Button>
                <Button className="w-full" onClick={handleAiVerify} disabled={isVerifying}>
                  <Check /> Verify
                </Button>
              </div>
            ) : (
              <Button size="lg" className="w-full" onClick={takePhoto}>
                <Camera /> Capture
              </Button>
            )}
            <Button variant="ghost" onClick={() => setView('initial')}>Back</Button>
        </CardFooter>
     </Card>
  );

  const renderAuthView = () => (
     <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => setView('initial')}>
            <X />
          </Button>
          <CardTitle className="text-center pt-8">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
        </CardHeader>
        <CardContent>
           <AuthForms mode={authMode} onAuthenticated={onVerified} />
        </CardContent>
     </Card>
  );

  const renderView = () => {
    switch(view) {
      case 'ai-verify': return renderAiVerifyView();
      case 'auth': return renderAuthView();
      case 'initial':
      default:
        return renderInitialView();
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      {renderView()}
    </div>
  );
}
