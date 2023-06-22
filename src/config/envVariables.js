import dotenv from 'dotenv';
const envVariables = () => {
    dotenv.config({
        path: './env/articleProcessorService.properties'
    });
    dotenv.config({
        path: './env/azure.properties'
    });
}

export default envVariables;