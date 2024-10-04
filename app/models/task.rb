class Task < ApplicationRecord
  belongs_to :article

  enum status: { ouverte: 'ouverte', fermee: 'fermee', en_cours: 'en cours' }
   # Par défaut, les tâches auront le statut 'ouverte'
   after_initialize :set_default_status, if: :new_record?

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

  # Pour gérer la récurrence et la période
  validate :validate_recurrence

  # Pour l'historique des tâches
  has_paper_trail

  scope :this_week, -> { where(realisation_date: Date.today.beginning_of_week..Date.today.end_of_week) }
  scope :upcoming, -> { where('realisation_date > ?', Date.today.end_of_week) }

  private

  def validate_recurrence
    if recurring && period.blank?
      errors.add(:period, "doit être précisé pour les tâches récurrentes")
    end
  end

  def set_default_color
    case self.task_type
    when 'réparations'
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
end
