const AWS = require('aws-sdk');

var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;

AWS.config.update({
  accessKeyId: process.env.awsAC,
  secretAccessKey: process.env.awsSAC,
  region: process.env.awsRegion
});

const s3 = new AWS.S3();



const checkAndCreateFolderS3 = async (bucketName, folderName) => { //return error
    if (!folderName.endsWith('/')) {
        folderName += '/';
    } 
    const params = {
        Bucket: bucketName,
        Prefix: folderName,
        MaxKeys: 1
    };
    try {
        const data = await s3.listObjectsV2(params).promise()
        const folderExists = data.Contents.length > 0;
    
        if (!folderExists) {
            // Create the folder
            await s3.putObject({Bucket: bucketName, Key: folderName}).promise()
            return false    // Folder created
        } else {
            return true // Folder already exists
        }
    } catch (error) {
        throw error
    }
}

const getListObjectsS3 = async (bucketName, folderName) => {
    if (!folderName.endsWith('/')) {
        folderName += '/';
    }
    
    const params = {
        Bucket: bucketName,
        Prefix: folderName
    };
    
    try {
        const data = await s3.listObjectsV2(params).promise();
        return data.Contents.map(item => ({...item, Bucket: bucketName}));
    } catch (error) {
        throw error;
    }
}



const deleteObjectsS3 = async (objects) => {    
    try {
        const deletePromises = objects.map((object) => {
            const params = {
                Bucket: object.Bucket,
                Key: object.Key
            };           
            return s3.deleteObject(params).promise();
        });
        await Promise.all(deletePromises);
        //console.log(`Deleted all objects in the folder.`);
    } catch (error) {
        throw error;
    }
}


const folderCleanerS3 = async (bucketName, folderName) => {
    //console.log(`Deleting folder in ${bucketName}: ${folderName}`);
    if (!folderName.endsWith('/')) {
        folderName += '/';
    }
    try {
        const objects = await getListObjectsS3(bucketName, folderName)
        //console.log(objects);
        
        if (objects.length === 0) return
        await deleteObjectsS3(objects)
    } catch (error) {
        throw error       
    }
}





interface IFileUploaderS3 {
    bucketName: string
    folderName: string
    files: {
        content: any
        fileName: string
    }[]
    checkFolder: boolean
}






const filesUploaderS3 = async ({bucketName = '3di', folderName = 'temp/', files = [], checkFolder = true}: IFileUploaderS3) => {
    if (!folderName.endsWith('/')) {
        folderName += '/';
    }
    if (checkFolder) {
        await checkAndCreateFolderS3(bucketName, folderName)
    }


    for (const file of files) {
        const targetKey = folderName + file.fileName; // Specify the target S3 key by combining the folder name and file name

        const params = {
          Bucket: bucketName,
          Key: targetKey,
          Body: file.content
        };
        
        try {
            await s3.upload(params).promise()
            //console.log(`File ${file.fileName} uploaded to ${folderName} successfully.`);
        } catch (error) {
            throw error            
        }
    }
}






export { checkAndCreateFolderS3, filesUploaderS3, folderCleanerS3, getListObjectsS3, deleteObjectsS3 }