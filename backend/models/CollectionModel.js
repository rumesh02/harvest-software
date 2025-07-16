const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  // Basic order information
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  
  // References to other collections
  merchantId: {
    type: String,
    required: true,
    index: true
  },
  
  farmerId: {
    type: String,
    required: true,
    index: true
  },
  
  // Product information
  productId: {
    type: String,
    required: true
  },
  
  productName: {
    type: String,
    required: true
  },
  
  // Bid and pricing information
  bidAmount: {
    type: Number,
    required: true
  },
  
  orderWeight: {
    type: Number,
    required: true
  },
  
  finalPrice: {
    type: Number,
    required: true
  },
  
  // Item code for tracking
  itemCode: {
    type: String,
    required: true,
    index: true
  },
  
  // Location information with fallback logic
  location: {
    // Primary location: Selected by farmer during listing
    selectedLocation: {
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      address: { type: String }
    },
    
    // Fallback location: Farmer's registered address
    farmerRegisteredAddress: {
      address: { type: String },
      district: { type: String }
    },
    
    // Computed display address (will be populated based on availability)
    displayAddress: {
      type: String,
      required: true
    }
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['confirmed', 'paid', 'processing', 'ready_for_pickup', 'collected', 'delivered', 'cancelled'],
    default: 'confirmed',
    index: true
  },
  
  // Collection details
  collectionDetails: {
    collectionMethod: {
      type: String,
      enum: ['app_transport', 'personal_transport', 'not_selected'],
      default: 'not_selected'
    },
    
    transportDetails: {
      vehicleId: { type: String },
      transporterId: { type: String },
      estimatedPickupTime: { type: Date },
      actualPickupTime: { type: Date }
    },
    
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  
  // Payment information
  paymentDetails: {
    paymentMethod: { type: String },
    paymentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDate: { type: Date }
  },
  
  // Farmer and merchant details (for quick access)
  farmerDetails: {
    name: { type: String },
    phone: { type: String },
    rating: { type: Number, default: 0 }
  },
  
  merchantDetails: {
    name: { type: String },
    phone: { type: String }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Delivery tracking
  deliveryTracking: {
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'failed'],
      default: 'pending'
    }
  }
}, { 
  timestamps: true,
  collection: 'collections'
});

// Pre-save middleware to compute display address based on availability
collectionSchema.pre('save', function(next) {
  // Logic for determining display address:
  // 1. If farmer selected a location during listing, use that
  // 2. Otherwise, use farmer's registered address + district
  
  if (this.location.selectedLocation && this.location.selectedLocation.address) {
    // Use the address selected by farmer during listing
    this.location.displayAddress = this.location.selectedLocation.address;
  } else if (this.location.farmerRegisteredAddress) {
    // Use farmer's registered address with district
    const { address, district } = this.location.farmerRegisteredAddress;
    
    if (address && district) {
      this.location.displayAddress = `${address}, ${district}`;
    } else if (address) {
      this.location.displayAddress = address;
    } else if (district) {
      this.location.displayAddress = district;
    } else {
      this.location.displayAddress = 'Location not available';
    }
  } else {
    this.location.displayAddress = 'Location not available';
  }
  
  // Update the updatedAt timestamp
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
collectionSchema.index({ merchantId: 1, status: 1 });
collectionSchema.index({ farmerId: 1, status: 1 });
collectionSchema.index({ createdAt: -1 });

// Virtual for getting formatted final price
collectionSchema.virtual('formattedFinalPrice').get(function() {
  return `Rs. ${this.finalPrice.toFixed(2)}`;
});

// Virtual for getting formatted bid amount
collectionSchema.virtual('formattedBidAmount').get(function() {
  return `Rs. ${this.bidAmount.toFixed(2)}`;
});

// Method to update location display address
collectionSchema.methods.updateDisplayAddress = function() {
  if (this.location.selectedLocation && this.location.selectedLocation.address) {
    this.location.displayAddress = this.location.selectedLocation.address;
  } else if (this.location.farmerRegisteredAddress) {
    const { address, district } = this.location.farmerRegisteredAddress;
    
    if (address && district) {
      this.location.displayAddress = `${address}, ${district}`;
    } else if (address) {
      this.location.displayAddress = address;
    } else if (district) {
      this.location.displayAddress = district;
    } else {
      this.location.displayAddress = 'Location not available';
    }
  } else {
    this.location.displayAddress = 'Location not available';
  }
};

// Static method to create collection from confirmed bid
collectionSchema.statics.createFromConfirmedBid = async function(confirmedBid, productData, farmerData) {
  const collection = new this({
    orderId: confirmedBid.orderId,
    merchantId: confirmedBid.merchantId,
    farmerId: confirmedBid.farmerId,
    productId: confirmedBid.items[0].productId,
    productName: confirmedBid.items[0].name,
    bidAmount: confirmedBid.items[0].price,
    orderWeight: confirmedBid.items[0].quantity,
    finalPrice: confirmedBid.amount,
    itemCode: confirmedBid.itemCode,
    
    // Location data
    location: {
      selectedLocation: productData ? {
        coordinates: productData.location?.coordinates,
        address: productData.location?.address
      } : null,
      
      farmerRegisteredAddress: {
        address: farmerData?.address,
        district: farmerData?.district
      }
    },
    
    status: confirmedBid.status || 'confirmed',
    
    // Farmer details
    farmerDetails: {
      name: farmerData?.name,
      phone: farmerData?.phone,
      rating: farmerData?.farmerRatings || 0
    },
    
    paymentDetails: {
      paymentMethod: confirmedBid.paymentMethod,
      paymentId: confirmedBid.paymentId,
      paymentStatus: confirmedBid.paymentStatus || 'pending'
    }
  });
  
  return collection;
};

module.exports = mongoose.model('Collection', collectionSchema);
