import React from "react";
import { useParams } from "react-router-dom";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Slider from "react-slick"; // uvozite knjižnico "react-slick" za drsnik slik
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { UserAuth } from "context/AuthContext";
import { useEffect, useState } from "react";
import api from "services/api";

import dotenv from 'dotenv';

export default function Podrobnosti({ izbris }) {
    const [uporabnikovEmail, setUporabnikovEmail] = useState("");
    const [izbira, setIzbira] = useState();
    const [error, setError] = useState(null);

    const { id } = useParams();
    let parsan_id;
    if (id !== undefined) {
        parsan_id = parseInt(id, 10);
    } else {
        parsan_id = undefined;
    }

    dotenv.config();

    useEffect(() => {
        if (parsan_id === undefined) return;
        api.get(`/artikel/${parsan_id}`)
            .then(res => {
                setIzbira(res.data);
            })

            .catch(err => {
                console.error(err);
                if (err.response && err.response.data && err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError("Napaka pri pridobivanju podatkov");
                }
            });
    }, [parsan_id]);



    const { user } = UserAuth();

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    useEffect(() => {
        if (!izbira) return;
        const uporabnikovId = izbira && izbira.uporabnik.id;


        api.post('uporabnik/get-email-from-id', { id: uporabnikovId })
            .then(res => {
                const uporabnikovEmail = res.data.userEmail;
                setUporabnikovEmail(uporabnikovEmail);
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.data && err.response.data.error) {
                    console.log("error message:", err.response.data.error);
                } else {
                    console.log("error message: Napaka pri pridobivanju podatkov");
                }
            });

    }, [izbira]);


    return (
        <>
            {error ? (
                <div className="text-center mt-12">
                    <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                        Prišlo je do napake!
                    </h3>
                    <Link to="/">
                        <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded-full shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={izbris()}>
                            Pojdi nazaj
                        </button>
                    </Link>
                </div>

            ) : (
                <div>
                    <IndexNavbar fixed={true} />
                    <section className="relative py-16 bg-blueGray-200">
                        <div className="container mx-auto px-4">
                            <div className="relative flex flex-col min-w-0 break-words bg-white w-full md:w-3/4 mx-auto mt-24 mb-4 shadow-xl rounded-lg">
                                <div className="px-6">
                                    <div className="text-center mt-12">
                                        <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                                            {izbira?.naslov}
                                        </h3>
                                        <div className="mb-2 text-blueGray-600 mt-4">
                                            <i className="fas fa-map-marker mr-2 text-lg text-blueGray-400"></i>
                                            {izbira?.lokacija}
                                        </div>
                                        <div className="mb-2 text-blueGray-600 mt-4">
                                            <i className="fas fa-ruler-combined mr-2 text-lg text-blueGray-400"></i>
                                            Velikost: {izbira?.velikost}
                                        </div>
                                        <div className="mb-2 text-blueGray-600 mt-4">
                                            <i className="fas fa-euro-sign mr-2 text-lg text-blueGray-400"></i>
                                            {izbira?.cena}
                                        </div>
                                        <div className="mb-2 text-blueGray-600 mt-4">
                                            <i className="fas fa-info-circle mr-2 text-lg text-blueGray-400"></i>
                                            Opis: <br></br>{izbira?.opis}
                                        </div>
                                        <Link to={`/prodajalec/${izbira?.uporabnik?.id}`}>
                                            <div className="mb-2 text-blueGray-900 mt-4">
                                                <i className="fas fa-user mr-2 text-lg text-blueGray-900"></i>
                                                Prodajalec: {izbira?.uporabnik.ime} {izbira?.uporabnik.priimek}
                                            </div>
                                        </Link>
                                        <br></br>
                                        <div className="relative flex flex-col min-w-0 break-words bg-blueGray-200 w-full md:w-3/4 mx-auto mb-24 shadow-xl rounded-lg">
                                            <div className="px-6">
                                                <section className="relative block" style={{ height: "70vh" }}>
                                                    <br></br>
                                                    <Slider {...settings}>
                                                        {izbira?.slike?.map((slika, index) => {
                                                            const delimiter = slika.includes("\\") ? "\\" : "/";
                                                            const slikaPath = slika.split(delimiter).pop();
                                                            return (
                                                                <div key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <img
                                                                        alt={`slika-${index}`}
                                                                        className="w-full align-middle rounded-lg"
                                                                        src={`${process.env.REACT_APP_BASE_URL}uploads/${slikaPath}`}
                                                                        style={{
                                                                            objectFit: "cover",
                                                                            height: "60vh",
                                                                            width: "60%",
                                                                            margin: "auto",
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </Slider>
                                                </section>
                                            </div>
                                        </div>
                                        <div className="flex justify-center mt-10 mb-8">
                                            {!user || user.email !== uporabnikovEmail && (
                                                <>
                                                    <Link to={`/nakup/${izbira?.id}`}>
                                                        <button
                                                            className="bg-teal-500 text-white active:bg-teal-600 font-bold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                            type="button"
                                                        >
                                                            Kupi
                                                        </button>
                                                    </Link>
                                                    {izbira?.za_zamenjavo === 1 && (
                                                        <div>
                                                            <Link to={`/zamenjava/${izbira?.id}`}>
                                                                <button
                                                                    className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                >
                                                                    Zamenjaj
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </section >
                    <Footer />
                </div>
            )}

        </>
    );


}




