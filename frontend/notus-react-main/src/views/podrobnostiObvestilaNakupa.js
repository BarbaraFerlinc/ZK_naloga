import Footer from "components/Footers/Footer";
import IndexNavbar from "components/Navbars/IndexNavbar"
import { UserAuth } from "context/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "services/api";
import Slider from "react-slick"; // uvozite knjižnico "react-slick" za drsnik slik

import dotenv from 'dotenv';

const PodrobnostiObvestilaNakupa = () => {
    const [oglas, setOglas] = useState({});
    const [uporabnikovId, setUporabnikovId] = useState("");

    const { user } = UserAuth();
    const { id } = useParams();
    let parsan_id;
    if (id !== undefined) {
        parsan_id = parseInt(id, 10);
    } else {
        parsan_id = undefined;
    }

    dotenv.config();

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };


    useEffect(() => {
        if (parsan_id === undefined) return;
        api.post('obvestilo/podrobnostiNakupa', { id: parsan_id })
            .then(res => {
                setOglas(res.data.obvestiloNakupa);
            })
            .catch(err => {
                console.error(err);
            });
    }, [parsan_id]);


    useEffect(() => {
        if (user.email) {
            const uporabnikovEmail = user.email;

            api.post('uporabnik/prijavljen-uporabnik', { email: uporabnikovEmail })
                .then(res => {
                    const userId = res.data.userId;
                    setUporabnikovId(userId);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [user.email]);

    useEffect(() => {
        if (parsan_id === undefined || uporabnikovId === "") return;
        const markNotificationAsRead = async () => {
            try {
                const response = await api.post('obvestilo/preberiNakup', {
                    id: parsan_id,
                    userId: uporabnikovId,
                });
            } catch (error) {
                console.error('Napaka pri označevanju obvestila kot prebrano', error);
            }
        };

        markNotificationAsRead();
    }, [uporabnikovId]);




    return (
        <>
            <div>
                <IndexNavbar fixed={true} />
                <section className="relative py-16 bg-blueGray-200">
                    <div className="container mx-auto px-4">
                        <div className="relative flex flex-col min-w-0 break-words bg-white w-full md:w-3/4 mx-auto mt-24 mb-4 shadow-xl rounded-lg">
                            <div className="px-6">
                                <div className="text-center mt-4 mb-12">
                                    <h3 class="text-4xl font-normal leading-normal mt-0 mb-2 text-pink-800">
                                        Podrobnosti nakupa
                                    </h3>
                                    <div className="flex flex-wrap">
                                        <div className="w-full px-4 flex-1">
                                            <span className="text-sm block my-4 p-3 text-blueGray-700 rounded border border-solid border-blueGray-100">
                                                <div className="text-center mt-4">
                                                    <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                                                        {oglas?.naslov}
                                                    </h3>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-map-marker mr-2 text-lg text-blueGray-400"></i>
                                                        {oglas?.lokacija}
                                                    </div>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-ruler-combined mr-2 text-lg text-blueGray-400"></i>
                                                        Velikost: {oglas?.velikost}
                                                    </div>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-euro-sign mr-2 text-lg text-blueGray-400"></i>
                                                        {oglas?.cena}
                                                    </div>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-info-circle mr-2 text-lg text-blueGray-400"></i>
                                                        Opis: <br></br>{oglas?.opis}
                                                    </div>
                                                    <br></br>
                                                    <div className="relative flex flex-col min-w-0 break-words bg-blueGray-200 w-full md:w-3/4 mx-auto mb-20 shadow-xl rounded-lg">
                                                        <div className="px-6">
                                                            <section className="relative block" style={{ height: "70vh" }}>
                                                                <br></br>
                                                                {<Slider {...settings}>
                                                                    {oglas?.slike?.map((slika, index) => {
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
                                                                </Slider>}
                                                            </section>
                                                        </div>
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >
                <Footer />
            </div >
        </>
    )








}

export default PodrobnostiObvestilaNakupa;