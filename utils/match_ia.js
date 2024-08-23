const PrismaClient = require ('@prisma/client')
const express = require('express')
const app = express()

app.use(express.json())

const prisma = new PrismaClient.PrismaClient()

async function querySurvey(email) {
  const Questionaire = await prisma.survey.findFirst({
    where: {
      userEmail: email
    },
    include: {
      user:{
        select: {
          age: true,
          experience: true,
        },
      },
    },
})
  return Questionaire
}

async function queryAnimal(R_species, total_plus){
  const animalesFiltrado = await prisma.animals.findMany({
    take: 30,
    where:{
        specie: {in: R_species},
        total_plus: {lte: total_plus + 2}, 
        total_plus: {gte: total_plus - 2},
    },
  })
  console.log(animalesFiltrado)
return animalesFiltrado
}

async function normalizarAge(U_age) {
  if(U_age < 10){
    return 0.25
  }
  if(U_age < 20){
    return 0.5
  }
  if(U_age < 30){
    return 0.75
  }
  if(U_age < 40){
    return 1
  }
}

async function neuronsFirst(Questionaire, formValues) {
  const {R_age, R_size, R_species, R_breed, R_space, R_weather, R_color,
    R_temperament, R_cost, R_time, R_training, U_age, experience} = Questionaire;
  const{age, size, training, specie, breed, color, temperament, maintenance,
     timeNeeded, space_Needed, weather, experienceNeeded} = formValues
  
  const neuron = [0,0,0,0,0,0,0,0,0,0,0,0,0]
  
  if(R_age >= age){
    neuron[0] = 1;
  }
  if((U_age + age)/2 >= 0.5){
    neuron[1] = 1;
  }
  if(R_size >= size){
    neuron[2] = 1;
  }
  if(R_space >= space_Needed){
    neuron[3] = 1;
  }

  R_species.map((x) => {
    if(x == specie){
      neuron[4] = 1
      return
    }
  })

  R_breed.map((x) => {
    if(x == breed){
      neuron[5] = 1
      return
    }
  })

  R_color.map((x) => {
    if(x == color){
      neuron[6] = 1
      return
    }
  })

  R_temperament.map((x) => {
    if(x == temperament){
      neuron[7] = 1
      return
    }
  })

  if(R_time >= timeNeeded){
    neuron[8] = 1;
  }
  if(R_training >= training || R_training == 1){
    neuron[9] = 1;
  }
  if(experience >= experienceNeeded){
    neuron[10] = 1;
  }
  if(R_cost >= maintenance){
    neuron[11] = 1;
  }
  if(R_weather >= weather){
    neuron[12] = 1;
  }

  return neuron
}

async function neuronsSecond(firstLayer){
  const neuronFirstLayer = firstLayer
  const neuron = [0,0,0,0,0]

  if((neuronFirstLayer[0] * 0.5 + neuronFirstLayer[1] * 0.5) == 1){
    neuron[0] = 1
  }
  if((neuronFirstLayer[2] * 0.5 + neuronFirstLayer[3] * 0.5) == 1){
    neuron[1] = 1
  }
  if((neuronFirstLayer[4] * 1 + neuronFirstLayer[5] * 0.5 + neuronFirstLayer[6] * 0.25 + neuronFirstLayer[7] * 0.75) >= 1.5){
    neuron[2] = 1
  }
  if((neuronFirstLayer[8] * 0.8 + neuronFirstLayer[9] * 0.5 + neuronFirstLayer[10] * 1) >= 1.5){
    neuron[3] = 1
  }
  if((neuronFirstLayer[11] * 0.5 + neuronFirstLayer[12] * 0.5) == 1){
    neuron[4] = 1
  }
  return neuron
}

async function neuronThird(secondLayer) {
  const neuronSecondLayer = secondLayer
  const neuron = [0,0]

  if((neuronSecondLayer[0] * 0.5 + neuronSecondLayer[1] * 1 + neuronSecondLayer[2] * 0.5) >= 1.5){
    neuron[0] = 1
  }
  if((neuronSecondLayer[3] * 0.5 + neuronSecondLayer[4] * 0.5) == 1){
    neuron[1] = 1
  }

  return neuron
}

async function neuronFinalLayer(layer) {
  const neuronlayer = layer
  const neuron = 0

  if((neuronlayer[0] * 0.5 + neuronlayer[1] * 0.5) == 1){
    neuron = 1
  }

  return neuron
}

async function neuronActivation(Questionaire, formValues){
  Questionaire.user.U_age = normalizarAge(Questionaire.user.U_age)
  const firstLayer = neuronsFirst(Questionaire, formValues)
  const secondLayer = neuronsSecond(firstLayer)
  const thirdLayer = neuronThird(secondLayer)
  const finalLayer = neuronFinalLayer(thirdLayer)
  return finalLayer
}

  app.get(`/:email`, async (req, res) => {
    const { email } = req.params
    const Questionaire = querySurvey(email)

    const {R_species, total_plus} = Questionaire
    const formValues = queryAnimal(R_species, total_plus)

    ;(await formValues).map((x) => {
      const a = neuronActivation(Questionaire, formValues[x])
      if(a == 0){
        formValues.splice(x, 1);
      }
    })

    res.json(formValues)
  })

app.listen(3001)