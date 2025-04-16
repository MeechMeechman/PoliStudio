import React from 'react';

// Tailwind and FontAwesome are expected to be loaded globally in index.html or via CDN in public/index.html

const LandingPage = () => (
  <div className="font-sans antialiased text-gray-900 bg-gray-50">
    {/* Navigation */}
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">PoliStudio</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#features" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Features</a>
              <a href="#benefits" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Benefits</a>
              <a href="#pricing" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Pricing</a>
              <a href="#contact" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Contact</a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <a href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Log in</a>
            <a href="/register" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign up</a>
          </div>
        </div>
      </div>
    </nav>

    {/* Hero Section */}
    <div className="hero-gradient" style={{background: 'linear-gradient(135deg, #1a56db 0%, #4f46e5 100%)'}}>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl hover:text-white focus:text-white">Revolutionize Your Campaign Management</h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">PoliStudio is the all-in-one SaaS platform designed specifically for political campaign managers to streamline operations and drive success.</p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <a href="/register" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 sm:px-8">Get Started</a>
              <a href="#contact" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-800 bg-opacity-60 hover:bg-opacity-70 sm:px-8">Request Demo</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <section id="features" className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Everything You Need to Win</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Our comprehensive suite of tools helps you manage every aspect of your political campaign.</p>
        </div>
        {/* Features grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature Cards */}
          {[
            {
              icon: 'fas fa-users',
              title: 'Voter Database Management',
              desc: 'Build and maintain a comprehensive voter database with tagging, segmentation, and interaction tracking.'
            },
            {
              icon: 'fas fa-hand-holding-usd',
              title: 'Donation Tracking',
              desc: 'Track donations, manage fundraising campaigns, and ensure compliance with campaign finance regulations.'
            },
            {
              icon: 'fas fa-hands-helping',
              title: 'Volunteer Management',
              desc: 'Coordinate volunteers, schedule shifts, and track volunteer activities and contributions.'
            },
            {
              icon: 'fas fa-calendar-alt',
              title: 'Event Management',
              desc: 'Plan, organize, and track campaign events with attendee management and follow-up tools.'
            },
            {
              icon: 'fas fa-phone-alt',
              title: 'Phone Banking & Texting',
              desc: 'Reach voters directly with integrated phone banking and text messaging tools.'
            },
            {
              icon: 'fas fa-map-marked-alt',
              title: 'Canvassing Tools',
              desc: 'Organize door-to-door outreach with optimized routes and mobile data collection.'
            },
            {
              icon: 'fas fa-robot',
              title: 'AI-Powered Content',
              desc: 'Generate compelling campaign content with AI-powered copywriting tools.'
            },
            {
              icon: 'fas fa-chart-line',
              title: 'Reporting & Analytics',
              desc: 'Gain insights into your campaign\'s performance with comprehensive reporting tools.'
            },
            {
              icon: 'fas fa-shield-alt',
              title: 'Security & Compliance',
              desc: 'Keep your campaign data secure and compliant with relevant regulations.'
            }
          ].map((feature, idx) => (
            <div key={feature.title} className="pt-6 transition duration-300 ease-in-out feature-card">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                      <i className={`${feature.icon} text-white text-2xl`}></i>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                  <p className="mt-5 text-base text-gray-500">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Benefits Section */}
    <section id="benefits" className="bg-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Benefits</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Why Choose PoliStudio</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Our platform offers unique advantages that help your campaign succeed.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Benefit Cards */}
          {[
            {
              icon: 'fas fa-tachometer-alt',
              title: 'Increased Efficiency',
              desc: 'Streamline campaign operations and eliminate manual processes, saving time and resources.'
            },
            {
              icon: 'fas fa-bullseye',
              title: 'Targeted Outreach',
              desc: 'Segment voters and supporters for more effective and personalized communication.'
            },
            {
              icon: 'fas fa-sync-alt',
              title: 'Real-time Updates',
              desc: 'Access up-to-date information and collaborate with your team in real-time.'
            },
            {
              icon: 'fas fa-lightbulb',
              title: 'Data-Driven Decisions',
              desc: 'Make informed decisions based on comprehensive analytics and reporting.'
            }
          ].map((benefit) => (
            <div key={benefit.title} className="bg-white rounded-lg shadow-sm p-6 flex items-start hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                  <i className={`${benefit.icon}`}></i>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-base text-gray-500">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials Section */}
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Testimonials</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">What Our Clients Say</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Testimonial Cards */}
          {[
            {
              name: 'Sarah Johnson',
              role: 'Campaign Manager',
              img: 'https://randomuser.me/api/portraits/women/32.jpg',
              text: 'PoliStudio transformed how we run our campaign. The voter database and volunteer management tools helped us coordinate our efforts more effectively than ever before.',
              stars: 5
            },
            {
              name: 'Michael Rodriguez',
              role: 'Field Director',
              img: 'https://randomuser.me/api/portraits/men/45.jpg',
              text: 'The canvassing tools and route optimization saved us countless hours. Our volunteers were able to reach more voters with less effort, and the data collection was seamless.',
              stars: 5
            },
            {
              name: 'Jennifer Lee',
              role: 'Communications Director',
              img: 'https://randomuser.me/api/portraits/women/68.jpg',
              text: 'The AI-powered content generation has been a game-changer for our messaging. We\'ve been able to create more engaging content in less time, allowing us to focus on strategy.',
              stars: 4.5
            }
          ].map((t) => (
            <div key={t.name} className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <img className="h-12 w-12 rounded-full" src={t.img} alt={t.name} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{t.name}</h3>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="mt-4 text-base text-gray-600">"{t.text}"</p>
              <div className="mt-4 flex text-yellow-400">
                {Array.from({length: Math.floor(t.stars)}).map((_,i) => <i key={i} className="fas fa-star"></i>)}
                {t.stars % 1 ? <i className="fas fa-star-half-alt"></i> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing Section */}
    <section id="pricing" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Pricing</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Plans for Campaigns of All Sizes</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Choose the plan that fits your campaign's needs and budget.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Pricing Cards */}
          {[
            {
              name: 'Starter',
              desc: 'Perfect for local campaigns',
              price: '$99',
              features: [
                'Up to 5,000 voter records',
                'Basic voter database management',
                'Volunteer management',
                'Event management',
                'Basic reporting'
              ],
              cta: 'Get Started',
              highlight: true,
              badge: 'Most Popular'
            },
            {
              name: 'Professional',
              desc: 'For state and congressional campaigns',
              price: '$299',
              features: [
                'Up to 50,000 voter records',
                'Advanced voter database management',
                'Donation tracking and fundraising',
                'Phone banking and texting',
                'Canvassing tools',
                'AI content generation (limited)',
                'Advanced reporting and analytics'
              ],
              cta: 'Get Started',
              highlight: false
            },
            {
              name: 'Enterprise',
              desc: 'For large statewide and national campaigns',
              price: '$999',
              features: [
                'Unlimited voter records',
                'All Professional features',
                'Unlimited AI content generation',
                'Custom integrations',
                'Dedicated account manager',
                'Priority support'
              ],
              cta: 'Contact Sales',
              highlight: false
            }
          ].map((plan) => (
            <div key={plan.name} className={`bg-white rounded-lg overflow-hidden hover:shadow-xl transition duration-300 ${plan.highlight ? 'shadow-lg border-2 border-blue-500' : 'shadow-sm'}`}>
              <div className="p-6">
                {plan.highlight && plan.badge && (
                  <div className="mb-4 text-center">
                    <span className="bg-blue-600 text-white text-sm font-semibold tracking-wider uppercase py-1 px-4 rounded-full inline-block">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{plan.desc}</p>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0">
                        <i className="fas fa-check text-green-500"></i>
                      </div>
                      <p className="ml-3 text-base text-gray-700">{f}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a href={plan.name === 'Enterprise' ? '/contact' : '/register'} className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">{plan.cta}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="bg-blue-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl hover:text-white focus:text-white">
          <span className="block">Ready to transform your campaign?</span>
          <span className="block text-blue-200">Get started with PoliStudio today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <a href="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-md text-base font-medium text-blue-600 bg-white hover:bg-blue-50">Get Started</a>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <a href="#contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-800 hover:bg-blue-900">Request Demo</a>
          </div>
        </div>
      </div>
    </section>

    {/* Contact Section */}
    <section id="contact" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Contact Us</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Get in Touch</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Have questions about PoliStudio? Our team is here to help.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <form className="grid grid-cols-1 gap-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">
                  <input type="text" name="name" id="name" className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" placeholder="Your name" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input type="email" name="email" id="email" className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" placeholder="your.email@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1">
                  <input type="text" name="phone" id="phone" className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" placeholder="(123) 456-7890" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1">
                  <textarea id="message" name="message" rows="4" className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" placeholder="How can we help you?"></textarea>
                </div>
              </div>
              <div>
                <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Send Message</button>
              </div>
            </form>
          </div>
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            <p className="mt-4 text-base text-gray-500">Our team is available Monday through Friday, 9am to 5pm ET.</p>
            <dl className="mt-8 space-y-6">
              <dd className="flex text-base text-gray-500"><i className="fas fa-phone-alt flex-shrink-0 h-6 w-6 text-blue-600"></i><span className="ml-3">(555) 123-4567</span></dd>
              <dd className="flex text-base text-gray-500"><i className="fas fa-envelope flex-shrink-0 h-6 w-6 text-blue-600"></i><span className="ml-3">info@polistudio.example.com</span></dd>
              <dd className="flex text-base text-gray-500"><i className="fas fa-map-marker-alt flex-shrink-0 h-6 w-6 text-blue-600"></i><span className="ml-3">123 Democracy Way<br/>Washington, DC 20001</span></dd>
            </dl>
            <div className="mt-8 flex space-x-6">
              <a href="#" className="text-blue-600 hover:text-blue-500"><span className="sr-only">Facebook</span><i className="fab fa-facebook-f text-2xl"></i></a>
              <a href="#" className="text-blue-600 hover:text-blue-500"><span className="sr-only">Twitter</span><i className="fab fa-twitter text-2xl"></i></a>
              <a href="#" className="text-blue-600 hover:text-blue-500"><span className="sr-only">LinkedIn</span><i className="fab fa-linkedin-in text-2xl"></i></a>
              <a href="#" className="text-blue-600 hover:text-blue-500"><span className="sr-only">Instagram</span><i className="fab fa-instagram text-2xl"></i></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#features" className="text-base text-gray-300 hover:text-white">Features</a></li>
              <li><a href="#pricing" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Demo</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Security</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Guides</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
              <li><a href="#contact" className="text-base text-gray-300 hover:text-white">Contact</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} PoliStudio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
