const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const formidable = require('formidable');

const PORT = 8000;

const readFileTemplate = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath,"utf-8",(err, data) =>{
            if(err) {
                reject(err.message)
            }
            resolve(data)
        })
    })
}

//b1  tao server
let server = http.createServer(async (req, res) => {

    let urlRequest =  url.parse(req.url);
    let urlPath = urlRequest.pathname;

    let method = req.method;

    switch(urlPath) {
        case '/':
            res.end('Da vao trang chu');
            break;
        case '/products':
            let dataHTML = await readFileTemplate('./templates/products/list.html');
            let data = await readFileTemplate('./data.json');
            let products = JSON.parse(data)
            console.log(products)

            let html = '';
            products.forEach((item, index) => {
                html += '<tr>';
                html += '<td>' + (index + 1) + '</td>';
                html += '<td>' + item.name + '</td>';
                html += '<td>' + item.price + '</td>';
                html += `<td><a href="/delete?index=${index}" class="btn btn-danger">Delete</a></td>`;
                html += '</tr>';
            })
            res.writeHead(200, {'Content-type': 'text/html'})
            dataHTML = dataHTML.replace('{list-product}', html)
            res.write(dataHTML);
            //  set content-type
            res.end();
            break;
        case '/add':
            if (method === 'GET') {
                let dataHTMLAdd = await readFileTemplate('./templates/products/add.html');
                res.write(dataHTMLAdd)
                res.end();
            } else {
                // lay du lieu tu form  = thu vien
                const form = formidable({ multiples: true });
                form.parse(req, (err, fields, files) => {
                    if (err) {
                        res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
                        res.end(String(err));
                        return;
                    }
                    console.log(fields)

                    let oldpath = files.img.filepath;
                    let newpath = './upload/' + files.img.originalFilename;

                    fs.rename(oldpath, newpath, async function (err) {
                        if (err) throw err;

                        let data = await readFileTemplate('./data.json');
                        let products = JSON.parse(data)

                        let product = {
                            name: fields.name,
                            price: fields.price,
                            image: newpath
                        }
                        products.push(product)

                        fs.writeFile('./data.json', JSON.stringify(products), err => {
                            if (err){
                                throw new Error(err.message)
                            }

                            // chuyen huong
                            res.writeHead(301, {Location: '/products'})
                            res.end();
                        })

                    });

                });


                // lay du lieu tu form theo cach thong thuong
                /*
                let dataForm = '';
                req.on('data', chunk => {
                    dataForm += chunk
                })
                req.on('end', async () => {
                    dataForm = qs.parse(dataForm);
                    let data = await readFileTemplate('./data.json');
                    let products = JSON.parse(data)
                    products.push(dataForm)

                    fs.writeFile('./data.json', JSON.stringify(products), err => {
                        if (err){
                            throw new Error(err.message)
                        }

                        // chuyen huong
                        res.writeHead(301, {Location: '/products'})
                        res.end();
                    })
                })

                 */
            }

            break;
        case '/delete':
            let index = qs.parse(urlRequest.query).index;
            console.log(index)
            res.end()
            break;
    }
})

server.listen(PORT, 'localhost', () => {
    console.log('server listening on port' + PORT)
})
