'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { 
        foreignKey: 'recipientId', 
        as: 'recipient' 
      });
      Notification.belongsTo(models.CourseOffering, { 
        foreignKey: 'allocationId', 
        as: 'courseOffering' 
      });
    }

    // Instance method to mark notification as sent
    async markAsSent() {
      this.status = 'sent';
      this.sentAt = new Date();
      await this.save();
    }

    // Instance method to mark notification as failed
    async markAsFailed(error) {
      this.status = 'failed';
      this.metadata = {
        ...this.metadata,
        error: error.message,
        failedAt: new Date()
      };
      await this.save();
    }

    // Static method to create facilitator reminder
    static async createFacilitatorReminder(facilitatorId, allocationId, weekNumber, courseInfo) {
      return await this.create({
        type: 'facilitator_reminder',
        recipientId: facilitatorId,
        allocationId,
        weekNumber,
        title: 'Weekly Activity Log Reminder',
        message: `Please submit your weekly activity log for Week ${weekNumber} of ${courseInfo.moduleName} (${courseInfo.className}).`,
        metadata: {
          courseInfo,
          reminderType: 'weekly_submission'
        }
      });
    }

    // Static method to create manager alert
    static async createManagerAlert(managerId, facilitatorInfo, allocationId, weekNumber, alertType) {
      const titles = {
        'missing_submission': 'Missing Activity Log Submission',
        'late_submission': 'Late Activity Log Submission',
        'compliance_warning': 'Compliance Warning'
      };

      const messages = {
        'missing_submission': `${facilitatorInfo.email} has not submitted their activity log for Week ${weekNumber}.`,
        'late_submission': `${facilitatorInfo.email} submitted their activity log for Week ${weekNumber} after the deadline.`,
        'compliance_warning': `${facilitatorInfo.email} has multiple missing submissions and requires attention.`
      };

      return await this.create({
        type: 'manager_alert',
        recipientId: managerId,
        allocationId,
        weekNumber,
        title: titles[alertType],
        message: messages[alertType],
        metadata: {
          facilitatorInfo,
          alertType,
          severity: alertType === 'compliance_warning' ? 'high' : 'medium'
        }
      });
    }
  }

  Notification.init({
    type: {
      type: DataTypes.ENUM('facilitator_reminder', 'manager_alert', 'deadline_warning'),
      allowNull: false
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    allocationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'CourseOfferings',
        key: 'id'
      }
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('metadata');
        if (!rawValue) return {};
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return {};
          }
        }
        return rawValue;
      },
      set(val) {
        this.setDataValue('metadata', JSON.stringify(val));
      }
    }
  }, {
    sequelize,
    modelName: 'Notification',
    indexes: [
      { fields: ['recipientId'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['scheduledFor'] },
      { fields: ['allocationId', 'weekNumber'] }
    ]
  });

  return Notification;
};