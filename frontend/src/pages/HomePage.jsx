import { useEffect, useState } from 'react';
import restaurante1 from '../assets/imgs/restaurante1.png';
import restaurante2 from '../assets/imgs/restaurante2.png';

const carouselImages = [
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1400&q=80',
];

function HomePage({ onGoToMenu }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="landing-card">
      <div className="landing-copy">
     
        <h2>🌿 Bem-vindo ao Sabor do Campo</h2>

        <div className="landing-story">
          
          <p>
            No coração do Bairro Castelo, o Sabor do Campo nasceu com a missão de oferecer uma alimentação mais leve, saudável e consciente, sem abrir mão do sabor.
            Nosso foco principal é a culinaria vegetariana e vegana, com pratos preparados
            diariamente com ingredientes frescos, naturais e cheios de sabor.
          </p>
          <p>
            Pensamos em cada detalhe do nosso cardapio para quem busca bem-estar na
            alimentacao, mas tambem oferecemos opcoes tradicionais para atender todos os
            gostos.
          </p>
          <p>
            Aqui, voce encontra refeicoes completas, bem servidas e com aquele tempero
            caseiro que conforta.
          </p>
        </div>
      </div>

      <div className="landing-section">
        <h3>Nosso estabelecimento</h3>
        <div className="front-gallery">
          <img src={restaurante1} alt="Fachada do restaurante 1" className="front-image" />
          <img src={restaurante2} alt="Fachada do restaurante 2" className="front-image" />
        </div>
      </div>

      <div className="landing-section">
        <h3>Pratos em destaque</h3>
      </div>

      <div className="landing-carousel" aria-label="Carrossel de pratos em destaque">
        <div
          className="landing-carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {carouselImages.map((image, index) => (
            <div className="landing-slide" key={image}>
              <img src={image} alt={`Imagem ${index + 1} do restaurante`} />
            </div>
          ))}
        </div>
      </div>

      <div className="landing-dots" aria-hidden="true">
        {carouselImages.map((_, index) => (
          <button
            type="button"
            key={index}
            className={index === currentIndex ? 'landing-dot active' : 'landing-dot'}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      <button type="button" className="landing-cta" onClick={onGoToMenu}>
        Faça seu Pedido
      </button>
    </section>
  );
}

export default HomePage;
