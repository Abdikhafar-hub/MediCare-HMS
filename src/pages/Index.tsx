import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui-custom/Button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRightIcon, CheckCircle2Icon, HeartPulseIcon, ShieldCheckIcon, StarIcon, Users2Icon, MenuIcon, XIcon } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 fixed w-full z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">HMS</span>
                </div>
                <span className="font-bold text-xl text-gray-800">MediCare</span>
              </div>
              <span className="text-xs text-gray-600">Powered by A.khafar Solutions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">Home</Link>
            <Link to="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">Features</Link>
            <Link to="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">Testimonials</Link>
            <Link to="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">Contact</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600 hover:text-blue-600" onClick={toggleMenu}>
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-sm">
            <nav className="flex flex-col items-center gap-4 py-4">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={toggleMenu}>Home</Link>
              <Link to="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={toggleMenu}>Features</Link>
              <Link to="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={toggleMenu}>Testimonials</Link>
              <Link to="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200" onClick={toggleMenu}>Contact</Link>
              <div className="flex flex-col items-center gap-3">
                {isAuthenticated ? (
                  <Link to="/dashboard" onClick={toggleMenu}>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">Go to Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={toggleMenu}>
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Log In</Button>
                    </Link>
                    <Link to="/signup" onClick={toggleMenu}>
                      <Button className="bg-blue-600 text-white hover:bg-blue-700">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-screen md:min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-blue-50 pt-20">
  <div 
    className="absolute inset-0 bg-center bg-cover bg-no-repeat md:bg-cover md:bg-center z-0"
    style={{
      backgroundImage: `url('https://res.cloudinary.com/ddkkfumkl/image/upload/v1742584136/qvkxaqhoviht0yjogpdt.png')`,
    }}
  >
    <div className="absolute inset-0 bg-black/40"></div> {/* Overlay for better text readability */}
  </div>

  <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
    <div className="text-center space-y-6 md:space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-white">
        Modern Healthcare Management Solution
      </h1>
      <p className="text-lg md:text-xl text-gray-200">
        A comprehensive hospital management system that streamlines operations, improves patient care, and enhances overall efficiency.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {isAuthenticated ? (
          <Link to="/dashboard">
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700" glassEffect>
              Go to Dashboard
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-black bg-white hover:bg-gray-100" glassEffect>
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">
                Log In
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
</section>


      {/* Features Section */}
      <section id="features" className="py-12 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-800">Comprehensive Features</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Our hospital management system offers a wide range of features to streamline your healthcare operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Users2Icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">Patient Management</h3>
              <p className="text-gray-600">
                Complete patient profiles with medical history, appointments, and billing information in one place.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <HeartPulseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">Electronic Medical Records</h3>
              <p className="text-gray-600">
                Secure, accessible digital records that improve care coordination and reduce administrative burden.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">Role-Based Access Control</h3>
              <p className="text-gray-600">
                Secure system with customized access levels for different staff roles, ensuring data protection.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                  <path d="M16 18h.01" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">Appointment Scheduling</h3>
              <p className="text-gray-600">
                Easy-to-use scheduling system for patients and healthcare providers with automated reminders.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M5 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">Pharmacy Management</h3>
              <p className="text-gray-600">
                Integrated prescription management, inventory tracking, and medication dispensing system.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">Analytics & Reporting</h3>
              <p className="text-gray-600">
                Powerful data visualization tools to track hospital performance, patient trends, and revenue metrics.
              </p>
            </div>
          </div>

          <div className="mt-12 md:mt-16 text-center">
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700" glassEffect>
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-24 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-800">Trusted by Healthcare Professionals</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about how our system has transformed their practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-1 mb-4 text-amber-500">
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
              </div>
              <p className="mb-6 italic text-gray-600">
                "This HMS has completely transformed our hospital's workflow. The interface is intuitive, and the patient management system has helped us reduce administrative time by 40%."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">HM</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Dr. Hussein Mohamed</p>
                  <p className="text-sm text-gray-600">Chief Medical Officer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-1 mb-4 text-amber-500">
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
              </div>
              <p className="mb-6 italic text-gray-600">
                "The appointment scheduling system has minimized no-shows and the electronic medical records have made patient information instantly accessible. It's been a game changer."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">SN</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Susan Ndungu</p>
                  <p className="text-sm text-gray-600">Head Nurse</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-1 mb-4 text-amber-500">
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
              </div>
              <p className="mb-6 italic text-gray-600">
                "From an administration perspective, the analytics dashboard has provided invaluable insights that have helped us optimize staffing and improve resource allocation."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">AI</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Abdikhafar Issack</p>
                  <p className="text-sm text-gray-600">Hospital Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-12 md:py-24 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-800">Ready to transform your healthcare facility?</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Join thousands of healthcare providers who have improved their operations with our hospital management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700" glassEffect>
                  {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50" onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                Learn More
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">HMS</span>
                    </div>
                    <span className="font-bold text-gray-800">MediCare</span>
                  </div>
                  <span className="text-xs text-gray-600">Powered by A.khafar Solutions</span>
                </div>
              </Link>
              <p className="text-sm text-gray-600 mb-4">
                A comprehensive hospital management system designed to transform healthcare operations.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-800">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-800">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-800">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-6 text-center">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} MediCare HMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;