import React, { useState } from "react";
import NavigationLayout from "../../NavigationLayout/NavigationLayout";
import toast from "react-hot-toast";

const clothesData = [
    { id: 1, name: "Men's T-Shirt", price: 100, image: "https://img.freepik.com/premium-vector/white-men-tshirt-fashion-illustration-template_444663-124.jpg" },
    { id: 2, name: "Women's Dress", price: 200, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHex-mWF6z26lbMcDcvf8cUBNp4Kb6gm5Cbw&s" },
    { id: 3, name: "Men's Jacket", price: 300, image: "https://img.freepik.com/free-vector/front-basic-white-grey-bomber-jacket-isolated_1308-59980.jpg" },
    { id: 4, name: "Women's Scarf", price: 50, image: "https://img.freepik.com/premium-vector/portrait-beautiful-young-woman-sunglasses-with-scarf-her-head_503750-2655.jpg" },
    { id: 5, name: "Men's Shirt", price: 150, image: "https://i.pinimg.com/736x/69/5c/83/695c837010deacc37f498843d49e12af.jpg" },
    { id: 6, name: "Women's Kurti", price: 180, image: "https://img.freepik.com/premium-vector/flat-vector-people-illustration-woman-with-hindi-outfit_1268604-831.jpg?semt=ais_incoming" },
    { id: 7, name: "Men's Shorts", price: 120, image: "https://i.pinimg.com/736x/34/92/40/349240cd6228f4c316093a49265d07c5.jpg" },
    { id: 8, name: "Women's Skirt", price: 160, image: "https://img.freepik.com/premium-vector/vector-illustration-skirts-women-s-clothes-women-s-skirt-vector-sketch-illustration_231873-1774.jpg?w=360" },
    { id: 9, name: "Men's Sweater", price: 250, image: "https://img.freepik.com/premium-vector/happy-man-vector-wearing-hoodie_844724-18146.jpg" },
    { id: 10, name: "Women's Coat", price: 400, image: "https://i.pinimg.com/736x/db/63/72/db637246fc1c1a5b3cbf85bf89f005d4.jpg" },
];

const OrderPage = () => {
    const [cart, setCart] = useState({});

    const handleIncrement = (id) => {
        setCart((prevCart) => ({
            ...prevCart,
            [id]: (prevCart[id] || 0) + 1,
        }));
    };

    const handleDecrement = (id) => {
        setCart((prevCart) => ({
            ...prevCart,
            [id]: prevCart[id] > 0 ? prevCart[id] - 1 : 0,
        }));
    };

    const totalClothes = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce(
        (total, [id, quantity]) =>
            total + quantity * (clothesData.find((item) => item.id === parseInt(id)).price || 0),
        0
    );

    const handleFormSubmit = async() => {
        toast.dismiss();
        if(totalClothes == 0){
            toast.error("Please select clothes first");
            return;
        }else{
            toast.success("Page working correctly !!");
        }
    }

    return (
        <NavigationLayout>
            <div>
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Laundry Order Page</h1>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {clothesData.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col items-center"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-32 h-32 object-cover mb-4"
                                />
                                <h2 className="text-lg font-semibold">{item.name}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">₹{item.price}</p>
                                <div className="flex items-center mt-4 space-x-2">
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleDecrement(item.id)}
                                    >
                                        -
                                    </button>
                                    <span>{cart[item.id] || 0}</span>
                                    <button
                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                        onClick={() => handleIncrement(item.id)}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    className={`mt-4 px-4 py-2 rounded ${
                                    cart[item.id]
                                        ? "bg-gray-300 dark:bg-gray-600"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                    }`}
                                    disabled={cart[item.id] > 0}
                                    onClick={() => handleIncrement(item.id)}
                                >
                                    {cart[item.id] ? "Selected" : "Select"}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded shadow">
                        <h2 className="text-xl font-bold">Order Summary</h2>
                        <p>Total Clothes: {totalClothes}</p>
                        <p>Total Price: ₹{totalPrice}</p>
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            onClick={handleFormSubmit}
                        >   
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </NavigationLayout>
    );
};

export default OrderPage;
