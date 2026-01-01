
const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3000';
const ORDER_ID = 'mock-order-1';

const socket = io(SOCKET_URL);

socket.on('connect', () => {
    console.log('Simulator connected to server:', socket.id);

    // Join order room (as if being the driver/server emitting to room)
    // In reality, driver emits 'location_update' to server, server broadcasts to room.
    // We will simulate the driver emitting.

    let lat = 37.78825;
    let lng = -122.4324;

    console.log(`Starting simulation for Order: ${ORDER_ID}`);

    const interval = setInterval(() => {
        lat += 0.0001; // Move slightly
        lng += 0.0001;

        const location = { latitude: lat, longitude: lng };

        console.log('Driver emitting location:', location);
        socket.emit('location_update', { orderId: ORDER_ID, ...location });

    }, 2000);

    // Stop after 20 seconds
    setTimeout(() => {
        clearInterval(interval);
        socket.disconnect();
        console.log('Simulation finished.');
    }, 20000);
});

socket.on('disconnect', () => {
    console.log('Simulator disconnected');
});
