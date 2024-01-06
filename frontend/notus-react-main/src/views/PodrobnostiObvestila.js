import Footer from "components/Footers/Footer";
import IndexNavbar from "components/Navbars/IndexNavbar"
import { UserAuth } from "context/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "services/api";
import Slider from "react-slick"; // uvozite knjižnico "react-slick" za drsnik slik

import dotenv from 'dotenv';

const PodrobnostiObvestila = () => {
    const [obvestilo1, setObvestilo1] = useState({});
    const [obvestilo2, setObvestilo2] = useState({});
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
        api.post('obvestilo/podrobnostiObvestila', { id: parsan_id })
            .then(res => {
                const obvestilo1 = res.data.obvestilo1;
                const obvestilo2 = res.data.obvestilo2;
                setObvestilo1(obvestilo1);
                setObvestilo2(obvestilo2);
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
                                        Podrobnosti zamenjave
                                    </h3>

                                    <div className="flex flex-wrap">
                                        <div className="w-full md:w-6/12 px-4">
                                            <span className="text-sm block my-4 p-3 text-blueGray-700 rounded border border-solid border-blueGray-100">
                                                <div className="text-center mt-12">
                                                    <h3 className="text-2xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                                                        {obvestilo1?.naslovOglasa}
                                                    </h3>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i class="fas fa-user mr-2 text-lg text-blueGray-400"></i>
                                                        {obvestilo1?.ime} {obvestilo1?.priimek}
                                                    </div>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-info-circle mr-2 text-lg text-blueGray-400"></i>
                                                        {obvestilo1?.email}
                                                    </div>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-phone mr-2 text-lg text-blueGray-400"></i>
                                                        {obvestilo1?.telefon}
                                                    </div>
                                                    <br></br>
                                                    <div className="relative flex flex-col min-w-0 break-words bg-blueGray-200 w-full md:w-3/4 mx-auto mb-20 shadow-xl rounded-lg">
                                                        <div className="px-6">
                                                            <section className="relative block" style={{ height: "70vh" }}>
                                                                <br></br>
                                                                {<Slider {...settings}>
                                                                    {obvestilo1?.slike?.map((slika, index) => {
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
                                                                                        width: "100%",
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
                                        <div className="w-full md:w-6/12 px-4">
                                            <span className="text-sm block my-4 p-3 text-blueGray-700 rounded border border-solid border-blueGray-100">
                                                <div className="text-center mt-12">
                                                    <h3 className="text-2xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                                                        {obvestilo2?.naslov}
                                                    </h3>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i class="fas fa-user mr-2 text-lg text-blueGray-400"></i>
                                                        {obvestilo2?.ime} {obvestilo2?.priimek}
                                                    </div>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-info-circle mr-2 text-lg text-blueGray-400"></i>
                                                        {obvestilo2?.email}
                                                    </div>
                                                    <div className="mb-2 text-blueGray-600 mt-4">
                                                        <i className="fas fa-phone mr-2 text-lg text-blueGray-400"></i>
                                                        {obvestilo2?.telefon}
                                                    </div>
                                                    <br></br>
                                                    <div className="relative flex flex-col min-w-0 break-words bg-blueGray-200 w-full md:w-3/4 mx-auto mb-20 shadow-xl rounded-lg">
                                                        <div className="px-6">
                                                            <section className="relative block" style={{ height: "70vh" }}>
                                                                <br></br>
                                                                {<Slider {...settings}>
                                                                    {obvestilo2?.slike?.map((slika, index) => {
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
                                                                                        width: "100%",
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

export default PodrobnostiObvestila