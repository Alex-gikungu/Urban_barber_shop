import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';

const barberServices = [
  {
    id: 1,
    title: 'Classic Haircut',
    price: 500,
    discountPrice: 400,
    person: 'John',
    description: 'A crisp, modern haircut tailored to your style by our expert barbers.',
    image: 'https://imgs.search.brave.com/1XAvfWYg-lmBVNEEvXkvcxQ-msM0t6xlGKGHioefDT4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jb3Zl/cmNsYXAuY29tL2Fz/c2V0cy9ibG9nL2Ry/b3AtZmFkZS1oYWly/Y3V0cy1mb3ItYmxh/Y2stbWVuL2xvdy1m/YWRlLWhhaXJjdXQu/anBn',
  },
  {
    id: 2,
    title: 'Beard Trim',
    price: 300,
    person: 'Michael',
    description: 'Neatly shape and trim your beard for a clean, professional look.',
    image: 'https://imgs.search.brave.com/Xfc_Sxe2YW0WzlpcIdBpx9OPCo6Aiby3vcUDs-x-t9c/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzA2LzYy/LzNhLzA2NjIzYTRi/YmJkMmFkMjFmNDE3/ZDhkYmIzZWFiMDY2/LmpwZw',
  },
  {
    id: 3,
    title: 'Hot Towel Shave',
    price: 250,
    person: 'David',
    description: 'Experience a smooth, comfortable shave with our traditional hot towel treatment.',
    image: 'https://imgs.search.brave.com/03ClUWd4hsBYRWOGwSh4L-QmlnwYEcNqpU4O569kIM4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/ZmlmdGhhdmViYXJi/ZXJzaG9wLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyMi8w/OC9yb3lhbC1ob3Qt/dG93ZWwtc2hhdmUt/d2l0aC1yYXpvci53/ZWJw',
  },
  {
    id: 4,
    title: 'Hair Coloring',
    price: 800,
    discountPrice: 650,
    person: 'Alex',
    description: 'Enhance your style with expertly applied hair coloring services.',
    image: 'https://imgs.search.brave.com/74yjXxkV2GhwgW_U6hlyPoBpmGCZsYpHDZQQEFtyp8k/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NDE5UEdOWmRQSEwu/anBn',
  },
  {
    id: 5,
    title: 'Hair Wash',
    price: 150,
    person: 'Samuel',
    description: 'Refresh your hair with a rejuvenating wash using top-quality products.',
    image: 'https://imgs.search.brave.com/dkOtEG_6qg42F0_UzczePU8i8PUs2kvvwCmp9cPSWe8/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTIz/NDgwOTUvcGhvdG8v/bWFuLWhhdmluZy1o/aXMtaGFpci1zaGFt/cG9vZWQuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPU5aZXBl/QjkxRmVhanlhcDhj/b25yZmVFRUVjdjc1/RE1MNGZ4cTIyUUxX/OTA9',
  },
  {
    id: 6,
    title: 'Hair Styling',
    price: 600,
    person: 'James',
    description: 'Get your hair styled for any occasion with personalized recommendations.',
    image: 'https://imgs.search.brave.com/5XfAInJNQ0zI5ofUMzoiK6Swlof8wT7zsL18nZPxe5k/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTU3/MTk4NTM0L3Bob3Rv/L2ludHJpY2F0ZS1o/YWlyLXN0eWxlLXBy/b2ZpbGUtb2YtYS15/b3VuZy1tYW4uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPTJC/a0loREFRYkh4TGZ0/TXJFMmlURi1pZmgz/Y3FiQ2F2akxRVF82/d2lhVW89',
  },
  {
    id: 7,
    title: 'Scalp Massage',
    price: 250,
    person: 'Mike',
    description: 'Relax with a soothing scalp massage.',
    image: 'https://imgs.search.brave.com/_VD9w1PDP93935NRyAEeUU3jiOV7bgMeyULofDZ7NEQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9qc2Fy/bmUuY29tL2Nkbi9z/aG9wL2ZpbGVzL0lN/R18wNDU1Xzg0NTE5/MTE5LTkyZTAtNGI4/MC1hNGI5LTA4MGYz/N2IzMTNiY18xNDQ1/eC5qcGc_dj0xNzM1/NDE0Mzg0',
  },
  {
    id: 8,
    title: 'Kids Haircut',
    price: 150,
    person: 'Oliver',
    description: 'A fun and friendly haircut for kids.',
    image: 'https://imgs.search.brave.com/lgWmoCFNsrcs4Vu-GBNZuwZgBB1WggjxE5F8EcdCk2A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9oYWly/Y3V0aW5zcGlyYXRp/b24uY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy9EZXNpZ25lZC1T/aWRlLXdpdGgtTGlu/ZS1VcC5qcGc',
  },
  {
    id: 9,
    title: 'Fade Haircut',
    price: 450,
    person: 'Chris',
    description: 'A stylish fade haircut.',
    image: 'https://imgs.search.brave.com/JLWkM0a37h9fJ_UhKQ0xneU9vxGqkYZcr0_-Juql0Ss/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vdGhlcmln/aHRoYWlyc3R5bGVz/LmNvbS93cC1jb250/ZW50L2dhbGxlcnkv/MzE3MjgvMS81OS1h/bHQtSGlnaC1GYWRl/LXdpdGgtU2hhdmVk/LVBhcnQtbmFtZS1q/YW5pZWxqYzI3Lmpw/Zz93PTUwMCZzc2w9/MQ',
  },
  {
    id: 10,
    title: 'Line-Up',
    price: 200,
    person: 'Mark',
    description: 'Clean up your hairline.',
    image: 'https://imgs.search.brave.com/t5fk26bHOplD_50BXbgdSSGr_-0rBASooiR1ubh95og/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jb3Zl/cmNsYXAuY29tL2Fz/c2V0cy9ibG9nL2Ry/b3AtZmFkZS1oYWly/Y3V0cy1mb3ItYmxh/Y2stbWVuL3RleHR1/cmVkLWZhZGUtaGFp/cmN1dC5qcGc',
  },
  {
    id: 11,
    title: 'Facial Treatment',
    price: 400,
    discountPrice: 350,
    person: 'Mary',
    description: 'Revitalize your skin.',
    image: 'https://imgs.search.brave.com/imICEuikiUS7AyjsOoQ0ejR0UZuygn49j6tVk9Bco60/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzRmLzJm/Lzg5LzRmMmY4OTc4/NTUxZmU2NjI2MTRl/NTcyNTczNTAzMTJl/LmpwZw',
  },
  {
    id: 12,
    title: 'Dreadlock Styling',
    price: 600,
    person: 'Luke',
    description: 'Professional dreadlock maintenance and styling for a bold look.',
    image: 'https://imgs.search.brave.com/fa7uAkwBw9R1wpaLgQnpj1vCVMPCkl_khAUitiGgyEk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzFkLzM4/LzlkLzFkMzg5ZDA3/ZjdmZDc4ZjdkYzMx/NjMxMjFhOGZjMzI0/LmpwZw',
  },
];

const Services = () => {
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBookAppointment = (service) => {
    if (!isLoggedIn) {
      alert('Please log in to book an appointment.');
      navigate('/login');
      return;
    }
    navigate('/booking', {
      state: {
        serviceId: service.id,
        title: service.title,
        barberName: service.person,
        price: service.price,
        discountPrice: service.discountPrice,
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img1.wsimg.com/isteam/ip/c118cbcb-d10b-44fc-b513-6c49ad791ec3/blob.png/:/cr=t:16.67%25,l:0%25,w:100%25,h:66.67%25')",
          filter: 'brightness(0.4)',
          zIndex: 1,
        }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-50" style={{ zIndex: 2 }}></div>

      {/* Content */}
      <div className="relative z-10 py-12 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Our Barber Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {barberServices.map((service) => (
            <div
              key={service.id}
              className="relative bg-cover bg-center rounded-lg shadow-lg h-[500px] flex items-end transform hover:scale-105 hover:shadow-xl transition-all duration-300"
              style={{ backgroundImage: `url(${service.image})` }}
            >
              <div className="bg-gray-800/80 w-full rounded-b-lg p-8">
                <h3 className="text-3xl font-semibold mb-4 text-white">{service.title}</h3>
                {expandedCards[service.id] ? (
                  <div className="text-left">
                    <div className="text-white mb-4">
                      <span className={service.discountPrice ? 'line-through text-gray-400 mr-2' : ''}>
                        {service.price} KES
                      </span>
                      {service.discountPrice && (
                        <span className="text-green-400">{service.discountPrice} KES</span>
                      )}
                    </div>
                    <p className="mb-2 text-white">
                      <strong>Handled by:</strong> {service.person}
                    </p>
                    <p className="mb-6 text-white">{service.description}</p>
                    <div className="flex justify-between">
                      <button
                        onClick={() => toggleCard(service.id)}
                        className="bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-gray-200 transition"
                      >
                        Read Less
                      </button>
                      <button
                        onClick={() => handleBookAppointment(service)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleCard(service.id)}
                    className="bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-gray-200 transition"
                  >
                    Read More
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;