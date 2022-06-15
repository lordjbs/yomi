import { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'util/prisma'

export default async function getBooks(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  const data = await prisma.book.findMany({
    where: {
      seriesId: {
        equals: id as string,
      },
    },
  })

  if (!data || data.length === 0) res.status(404).json({ error: 'not found' })
  else
    res.status(200).json({
      id: id,
      total: data.length,
      data: data,
    })
}
