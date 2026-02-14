import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield, Bell, Brain, Clock, FileSearch, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

export default function Index() {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Eligibility',
      description: 'Our intelligent engine analyzes your profile against 100+ government schemes to find perfect matches.',
    },
    {
      icon: Bell,
      title: 'Expiry Alerts',
      description: 'Never miss a deadline. Get automatic notifications 7, 3, and 1 day before scheme application closes.',
    },
    {
      icon: FileSearch,
      title: 'Transparent AI',
      description: 'Understand exactly why you qualify or don\'t. Our AI explains eligibility criteria clearly.',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Stay updated with new schemes, deadline changes, and benefit modifications instantly.',
    },
  ];

  const steps = [
    { step: 1, title: 'Create Profile', description: 'Enter your age, income, occupation, and location' },
    { step: 2, title: 'Get Matched', description: 'AI analyzes eligibility across all schemes' },
    { step: 3, title: 'Apply Before Deadline', description: 'Direct links to official application portals' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner}
            alt="Government scheme eligibility"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Government Scheme Discovery</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Your Eligible{' '}
              <span className="text-primary">Government Schemes</span>{' '}
              Before They Expire
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Don't miss out on benefits you deserve. Our AI matches your profile with 100+ central 
              and state government schemes and alerts you before deadlines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/auth?mode=signup">
                      Check Your Eligibility
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/schemes">Browse All Schemes</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Updated Daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Use GovScheme Alert?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop spending hours searching through government websites. Let AI do the work for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-card border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to discover your eligible schemes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to={user ? '/dashboard' : '/auth?mode=signup'}>
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">100+</p>
              <p className="text-sm opacity-80">Government Schemes</p>
            </div>
            <div>
              <p className="text-4xl font-bold">₹10L+</p>
              <p className="text-sm opacity-80">Benefits Discovered</p>
            </div>
            <div>
              <p className="text-4xl font-bold">50K+</p>
              <p className="text-sm opacity-80">Citizens Helped</p>
            </div>
            <div>
              <p className="text-4xl font-bold">99%</p>
              <p className="text-sm opacity-80">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Users className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Don't Miss Out on Benefits You Deserve
            </h2>
            <p className="text-muted-foreground mb-8">
              Lakhs of Indians miss government scheme deadlines every year. 
              Join GovScheme Alert and never miss an opportunity again.
            </p>
            <Button size="lg" asChild>
              <Link to={user ? '/dashboard' : '/auth?mode=signup'}>
                Start Finding Schemes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
