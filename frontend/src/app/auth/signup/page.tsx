import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />

      <div className="z-10 w-full flex flex-col items-center">
        <div className="mb-12 text-center">
          <span className="bg-primary/20 text-primary-glow px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-primary/30">
            Version 1.0 Alpha
          </span>
        </div>
        
        <SignupForm defaultIsLogin={false} />

        <div className="mt-8 text-text-muted text-sm flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </main>
  );
}
