const mongoose = require('mongoose');

const genomeProfileSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  clean_talent_score: {
    type: Number,
    required: true
  },
  growth_likelihood: {
    type: Number,
    required: true
  },
  retention_prediction: {
    type: Number,
    required: true
  },
  culture_fit_score: Number,
  recommended_roles: [String],
  overall_genome_score: {
    type: Number,
    required: true
  },
  hiring_recommendation: {
    type: String,
    enum: ['STRONG_HIRE', 'HIRE', 'MAYBE', 'NO_HIRE'],
    required: true
  },
  strengths: [String],
  weaknesses: [String],
  development_areas: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('GenomeProfile', genomeProfileSchema);