import { SiteClient } from 'datocms-client';

export default async function recebedorDeRequest(request, response) {

  if (request.method === "POST") {
    const TOKEN = process.env.DATOCMS_TOKEN;
    console.log("####", TOKEN)

    const client = new SiteClient(TOKEN);

    const dato_response = await client.items.create({
      itemType: "966386",
      ...request.body
    })

    response.json({
      dados: dato_response,
    })
  } else {
    response.status(404).json({
      message: "Método não permitido"
    })
  }


}