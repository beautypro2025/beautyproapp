import Image from 'next/image';
import { motion } from 'framer-motion';

const images = [
  {
    src: '/images/professional-1.jpg',
    alt: 'Profissional usando tablet',
    title: 'Gestão Simplificada'
  },
  {
    src: '/images/professional-2.jpg',
    alt: 'Profissional usando laptop',
    title: 'Agendamento Online'
  },
  {
    src: '/images/professional-3.jpg',
    alt: 'Profissional no studio',
    title: 'Controle Financeiro'
  },
  {
    src: '/images/professional-4.jpg',
    alt: 'Profissional atendendo cliente',
    title: 'Relacionamento com Clientes'
  },
  {
    src: '/images/professional-5.jpg',
    alt: 'Profissional no ambiente de trabalho',
    title: 'Marketing Digital'
  },
  {
    src: '/images/professional-6.jpg',
    alt: 'Profissional gerenciando agenda',
    title: 'Gestão de Equipe'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ImageShowcase() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#FDF8F6] to-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-playfair text-center mb-12 text-[#1c1c1c]"
        >
          Transforme seu Negócio com BeautyPro
        </motion.h2>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {images.map((image, index) => (
            <motion.div
              key={image.src}
              variants={item}
              className="image-card group"
            >
              <div className="relative h-[300px] overflow-hidden rounded-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index < 3}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    console.error(`Erro ao carregar imagem: ${image.src}`);
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <h3 className="absolute bottom-4 left-4 text-white text-xl font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 