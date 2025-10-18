import { NextApiResponse } from 'next'
import { withAdmin, AuthenticatedRequest } from '../../../../../lib/middleware'
import { prisma } from '../../../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const { decision, moderatorNote } = req.body

    if (!decision || !['accepted', 'dismissed'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision' })
    }

    const report = await prisma.report.findUnique({
      where: { id: id as string },
      include: {
        reportedUser: {
          select: { id: true, creditScore: true }
        }
      }
    })

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id: id as string },
      data: {
        status: decision,
        moderatorId: req.user!.id,
        moderatorNote: moderatorNote || null,
        resolvedAt: new Date()
      }
    })

    // Update credit score if report is accepted
    if (decision === 'accepted') {
      const newCreditScore = Math.max(0, report.reportedUser.creditScore - 10)
      
      await prisma.user.update({
        where: { id: report.reportedUserId },
        data: { creditScore: newCreditScore }
      })

      // Check for repeated reports in last 30 days
      const recentReports = await prisma.report.count({
        where: {
          reportedUserId: report.reportedUserId,
          status: 'accepted',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })

      // Apply additional penalty for repeated reports
      if (recentReports >= 3) {
        await prisma.user.update({
          where: { id: report.reportedUserId },
          data: { creditScore: { decrement: 20 } }
        })
      }
    }

    return res.status(200).json({ report: updatedReport })
  } catch (error) {
    console.error('Resolve report error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAdmin(handler)
