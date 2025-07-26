
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      content: "Delivery Partner made my house shifting so easy. The drivers were professional and helped with loading and unloading. Highly recommended!",
      author: "Rahul Sharma",
      role: "Customer",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 2,
      content: "I use Delivery Partner regularly for my business deliveries. Their bikes are always on time and reliable. Great service!",
      author: "Priya Patel",
      role: "Business Owner",
      rating: 5,
      avatar: "https://www.shutterstock.com/image-photo/adult-female-avatar-image-on-260nw-2419909229.jpg"
    },
    {
      id: 3,
      content: "Outstanding service! The app is very user-friendly and the customer support team is extremely helpful. Best logistics platform!",
      author: "Vikram Singh",
      role: "Customer",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What our customers
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
              say about us
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thousands of customers trust Delivery Partner for their logistics needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-8 relative">
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <Quote className="h-4 w-4 text-white" />
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center mb-6 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-700 text-lg leading-relaxed mb-8 font-medium">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">{testimonial.author}</h4>
                  <p className="text-blue-600 font-medium">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="text-4xl font-bold text-blue-600 mb-2">4.8★</div>
            <div className="text-gray-600 font-medium">App Rating</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
            <div className="text-4xl font-bold text-green-600 mb-2">10M+</div>
            <div className="text-gray-600 font-medium">Happy Users</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8">
            <div className="text-4xl font-bold text-yellow-600 mb-2">50K+</div>
            <div className="text-gray-600 font-medium">Partners</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
            <div className="text-4xl font-bold text-purple-600 mb-2">35+</div>
            <div className="text-gray-600 font-medium">Districts</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
