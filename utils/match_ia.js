const PrismaClient = require ('@prisma/client')
const express = require('express')
const app = express()

app.use(express.json())

const prisma = new PrismaClient.PrismaClient()

async function query(formValues){
    const {R_breed, R_color, R_species, total_plus} = formValues;
  const animalesFiltrado = await prisma.animals.findMany({
    take: 10,
    where:{
        specie: {in: R_species},
        OR: [
          {breed: {in: R_breed},},
          {color: {in: R_color},},
        ],
        total_plus: {lte: total_plus + 2}, 
        total_plus: {gte: total_plus - 2},
    },
    select:{
        id: true,
    },
    orderBy: [
        {
            id: 'asc',
        },
    ],
  })
  console.log(animalesFiltrado)
return animalesFiltrado
}

  app.get(`/:email`, async (req, res) => {
    const { email } = req.params
    const Questionaire = await prisma.survey.findFirst({
        where: {
          userEmail: email
        },
    })
   const formValues = query(Questionaire)

    res.json(formValues)
  })

app.listen(3001)