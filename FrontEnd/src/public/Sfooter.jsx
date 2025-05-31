//import React from 'react'
import fb from './imag/fb.png';
import insta from './imag/insta.png';
import tw from './imag/tw.png';
const Sfooter = () => {
  return (
    <div>

      <footer className="text-center pt-2 bg-gray-900 text-gray-200">
        <div className="flex justify-center gap-20">
          <div>
            <img className="h-16 sm:h-24 w-auto rounded-full" src="../Assites/feth_AI_logo.png"
              alt="FETH AI LOGO`S" />
          </div>
          <div className=''>
            <p className=''>&copy; 2025 FETH AI. All rights reserved.</p>
            <div className="flex justify-center mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="mx-2 hover:scale-150">
                <img src={fb} alt="facebook" className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="mx-2 hover:scale-150">
                <img src={insta} alt="twitter" className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="mx-2 hover:scale-150">
                <img src={tw} alt="instagram" className="h-6 w-6" />
              </a>
            </div>
          </div></div>
      </footer>
    </div>
  )
}

export default Sfooter