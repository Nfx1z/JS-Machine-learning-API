const controller = require('./controller');

// Handler for POST /predict
const predictHandler = async (request, h) => {
    const { file } = request.payload;

    // Check if file exists
    if (!file) {
        return h.response({
            status: 'fail',
            message: 'File is required'
        }).code(400);
    }

    // Process prediction image
    try {
        const prediction = await controller.predictImage(file);
        return h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data: prediction
        }).code(200);
    } catch (err) {
        if (err.message === 'Payload content length greater than maximum allowed: 1000000') {
            return h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000'
            }).code(413);
        }
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        }).code(400);
    }
};

module.exports = {
    predictHandler
};
