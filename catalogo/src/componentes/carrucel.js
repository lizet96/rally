import React, { useState } from "react";
import Slider from 'react-slick';
import './App.css';

const Carrucel = ()=>{
    const [currentSlide, setCurrentSlide] = useState(0);

    const hadleSlideChange =(index) =>{
        setCurrentSlide(index);
    };

    const setting={
        dots: true,
        infinite: true,
        speed: 2000,
        slidesToShow:1,
        slidesToScroll:1,
        beforeChange:(_,nextIndex) => hadleSlideChange(nextIndex)
    };

    const buttonStyle = {
        backgroundColor: 'black',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        margin: '5px',
        cursor: 'pointer',
    };

    return(
        <div>
            <Slider {...settings}>
                <div>
                    <img src= "carru1.jpg" alt="imagen1"></img>
                </div>
                <div>
                    <img src= "carru2.jpg" alt="imagen2"></img>
                </div>
                <div>
                    <img src= "carru3.jpeg" alt="imagen3"></img>
                </div>
            </Slider>
            <div>
            <button onClick={()=> setCurrentSlide(0)}>Acerca de</button> 
            <button onClick={()=> setCurrentSlide(1)}>Cia</button> 
            <button onClick={()=> setCurrentSlide(2)}>Acceso ID</button> 
            </div>
           <p> Imagen actual: {currentSlide+1}</p> 
        </div>
    );
        
    
};

export default Carrucel;