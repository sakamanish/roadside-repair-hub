
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Car, MapPin, Clock, ArrowRight, Search } from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-bb-blue" />,
      title: 'Search',
      description: 'Find mechanics near you with the services you need.'
    },
    {
      icon: <MapPin className="h-10 w-10 text-bb-blue" />,
      title: 'Connect',
      description: 'Contact mechanics directly through our platform.'
    },
    {
      icon: <Wrench className="h-10 w-10 text-bb-blue" />,
      title: 'Get Help',
      description: 'Receive the assistance you need for your vehicle.'
    },
    {
      icon: <Clock className="h-10 w-10 text-bb-blue" />,
      title: 'Back on the Road',
      description: 'Get back to driving with minimal downtime.'
    }
  ];

  const features = [
    {
      title: "Find Local Mechanics",
      description: "Search for qualified mechanics in your area based on your specific needs"
    },
    {
      title: "Emergency Assistance",
      description: "Get quick help for roadside emergencies from nearby professionals"
    },
    {
      title: "Direct Communication",
      description: "Message mechanics directly through our platform to discuss your needs"
    },
    {
      title: "Verified Professionals",
      description: "All mechanics are verified to ensure quality service and trustworthiness"
    },
    {
      title: "Service History",
      description: "Keep track of all your vehicle service history in one place"
    },
    {
      title: "Rating System",
      description: "Choose mechanics based on ratings and reviews from other customers"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-bb-orange rounded-full mb-6 animate-pulse-slow">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Vehicle Trouble? <br />
              <span className="text-bb-blue">Find Help Fast</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Breakdown Buddy connects you with nearby mechanics for quick repairs and roadside assistance.
            </p>
            
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user?.role === 'customer' ? (
                  <Link to="/search">
                    <Button size="lg" className="bg-bb-blue hover:bg-bb-blue-dark text-white px-8">
                      Find a Mechanic
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/profile">
                    <Button size="lg" className="bg-bb-blue hover:bg-bb-blue-dark text-white px-8">
                      View Your Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-bb-blue hover:bg-bb-blue-dark text-white px-8">
                    Sign Up Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="px-8">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L60,112C120,128,240,160,360,154.7C480,149,600,107,720,101.3C840,96,960,128,1080,154.7C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">
              Breakdown Buddy makes finding mechanical help simple and fast.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <Card key={index} className="border bg-white">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto rounded-full bg-gray-100 p-4 w-16 h-16 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Use Breakdown Buddy?</h2>
            <p className="text-lg text-gray-600">
              Our platform offers everything you need for vehicle assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg" className="bg-bb-blue hover:bg-bb-blue-dark text-white px-8">
                  Join Breakdown Buddy Today
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-bb-blue text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-full mb-6">
              <Car className="h-8 w-8 text-bb-blue" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {isAuthenticated ? 'Need mechanical assistance?' : 'Ready to join Breakdown Buddy?'}
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              {isAuthenticated 
                ? 'Find qualified mechanics near you with just a few clicks.' 
                : 'Sign up today and connect with mechanics in your area.'}
            </p>
            
            {isAuthenticated ? (
              user?.role === 'customer' ? (
                <Link to="/search">
                  <Button size="lg" variant="outline" className="bg-white text-bb-blue hover:bg-gray-100 border-white px-8">
                    Find a Mechanic Now
                  </Button>
                </Link>
              ) : (
                <Link to="/profile">
                  <Button size="lg" variant="outline" className="bg-white text-bb-blue hover:bg-gray-100 border-white px-8">
                    Update Your Profile
                  </Button>
                </Link>
              )
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" variant="outline" className="bg-white text-bb-blue hover:bg-gray-100 border-white px-8">
                    Sign Up Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="secondary" className="bg-transparent border border-white text-white hover:bg-white/10 px-8">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
