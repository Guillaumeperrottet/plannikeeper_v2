class Task < ApplicationRecord
  belongs_to :article
  has_one :secteur, through: :article
  has_one :objet, through: :article

  enum status: { ouverte: 'ouverte', fermee: 'fermee', en_cours: 'en cours' }
  # Par défaut, les tâches auront le statut 'ouverte'
  after_initialize :set_default_status, if: :new_record?
  after_initialize :set_default_recurrence, if: :new_record?

  before_save :set_default_color

  # Pour l'image avec ActiveStorage
  has_one_attached :image

  # Validations
  validates :name, presence: true
  # validates :realisation_date, presence: true, unless: :recurring?
  validates :cfc, presence: true
  validates :executant, presence: true
  validates :task_type, presence: true
  validates :status, presence: true
  validates :recurrence_reminder_date, presence: true, if: :recurring?


  # Pour gérer la récurrence et la période
  validate :validate_recurrence

  # Pour l'historique des tâches
  has_paper_trail

  # Scope pour les tâches de cette semaine (moins de 7 jours avant la date de fin)
  scope :this_week, -> {
    where("(recurring = ? OR recurring IS NULL OR recurring = ?) AND end_date BETWEEN ? AND ?",
          false, true, Date.today.beginning_of_day, (Date.today + 7.days).end_of_day)
  }

  scope :upcoming, -> {
    where("(recurring = ? OR recurring IS NULL OR recurring = ?) AND end_date >= ?",
          false, true, (Date.today + 8.days).beginning_of_day)
  }

  private

  def validate_recurrence
    if recurring && period.blank?
      errors.add(:period, "doit être précisé pour les tâches récurrentes")
    end
  end

  def set_default_color
    case self.task_type
    when 'construction'
      self.color ||= 'orange'
    when 'récurrence'
      self.color ||= 'lightblue'
    when 'entretiens'
      self.color ||= 'lightgreen'
    end
  end

  def set_default_status
    self.status ||= 'ouverte'
  end

  def set_default_recurrence
    self.recurring ||= false
  end
end
