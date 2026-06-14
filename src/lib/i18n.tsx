// lib/i18n-context.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type Language = "kh" | "en";

export type Messages = {
  common: {
    login: string;
    signup: string;
    email: string;
    tryAgain: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    switchToLogin: string;
    switchToSignup: string;
    welcome: string;
    subtitle: string;
    platformDescription: string;
    featureMapTitle: string;
    featureMapDesc: string;
    featureKnowledgeTitle: string;
    featureKnowledgeDesc: string;
    featureMarketplaceTitle: string;
    featureMarketplaceDesc: string;
    featureForumTitle: string;
    featureForumDesc: string;
    highlightsTitle: string;
    highlightsSubtitle: string;
    highlightMarketplaceLabel: string;
    highlightKnowledgeLabel: string;
    highlightForumLabel: string;
    newsTitle: string;
    newsSubtitle: string;
    seeMore: string;
    getStarted: string;
    language: string;
    darkMode: string;
    lightMode: string;
    back: string;
    next: string;
    submit: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    loading: string;
    error: string;
    success: string;
    required: string;
    optional: string;
    selected: string;
    clickToUpload: string;
    addImages: string;
    canAddMore: string;
    moreImages: string;
    uploading: string;
    creating: string;
    to: string;
    shareYourFarmWithCommunity: string;
    enterFarmName: string;
    tellUsAboutYourFarm: string;
    upTo: string;
    addCrops: string;
    fullAddress: string;
    // Add missing keys
    pleaseSignIn: string;
    requiredFields: string;
    enterTitle: string;
    enterDescription: string;
    selectCategory: string;
    selectCertification: string;
    enterLocation: string;
  };
  nav: {
    home: string;
    transport: string;
    messages: string;
    profile: string;
    farmMap: string;
    createFarm: string;
  };
  farm: {
    createFarm: string;
    farmName: string;
    farmType: string;
    farmAbout: string;
    farmLocation: string;
    farmAddress: string;
    farmPhone: string;
    farmWebsite: string;
    farmTelegram: string;
    growingCrops: string;
    certifications: string;
    farmingMethods: string;
    products: string;
    profileImage: string;
    galleryImages: string;
    addItem: string;
    remove: string;
    selectLocation: string;
    farmCreated: string;
    farmCreationError: string;
    mustLogin: string;
    alreadyHaveFarm: string;
    stepBasicInfo: string;
    stepDetails: string;
    stepMediaContact: string;
    stepLocation: string;
    all: string;
    organic: string;
    fairTrade: string;
    sustainable: string;
  };
  auth: {
    loginRequired: string;
    mustLoginToAddFarm: string;
    loginNow: string;
    createAccount: string;
  };
  marketplace: {
    marketplace: string;
    shop: string;
    pleaseSignInToViewTrades: string;
    found: string;
    myFavorites: string;
    tradeRequest: string;
    for: string;
    pleaseUseValidImageFormats: string;
    tryDifferentSearch: string;
    updateReview: string;
    completeAllRequiredFields: string;
    myPosts: string;
    bestSeller: string;
    someFavoritesUnavailable: string;
    allProducts: string;
    maximumFileSize: string;
    createProduct: string;
    createTrade: string;
    productDetails: string;
    price: string;
    description: string;
    location: string;
    imageUploadFailed: string;
    posted: string;
    seller: string;
    products: string;
    trades: string;
    moreOptions: string;
    user: string;
    sellerInformation: string;
    cannotSendToYourself: string;
    reviews: string;
    filterModal: string;

    customerReviews: string;
    writeReview: string;
    submitReview: string;
    editReview: string;
    deleteReview: string;
    share: string;
    provideRatingAndComment: string;
    reviewCommentMaxLength: string;
    amazingProduct: string;
    checkOutThisProduct: string;
    productNotFound: string;
    anonymous: string;
    favoritesRemovedBySeller: string;
    addToCart: string;
    addToFavorites: string;
    createTradeRequest: string;
    tradeTitle: string;
    tradeDescription: string;
    showing: string;
    filteredResults: string;
    noProductsMatch: string;
    toUser: string;
    accept: string;
    decline: string;
    pending: string;
    tradeCreationFailed: string;
    tradeRequestsMustBeSentToOthers: string;
    accepted: string;
    declined: string;
    completed: string;
    filter: string;
    filters: string;
    reset: string;
    category: string;
    categories: string;
    certification: string;
    priceRange: string;
    minPrice: string;
    maxPrice: string;
    resetFilters: string;
    applyFilters: string;
    searchProducts: string;
    searchTrades: string;
    noProducts: string;
    noTrades: string;
    currentImages: string;

    loading: string;
    seeAll: string;
    enterTradeTitle: string;
    yourRating: string;
    yourReview: string;
    favoritesEmptyDescription: string;
    newImagesToAdd: string;
    shareYourExperience: string;
    tradeUpdateFailed: string;
    addPhotos: string;
    signInToReview: string;
    alreadyReviewed: string;
    noReviewsYet: string;
    updateTrade: string;
    beTheFirst: string;
    showAllReviews: string;
    showLessReviews: string;
    startShopping: string;
    chat: string;
    signInToTrade: string;
    yourProduct: string;
    existingImage: string;
    images: string;
    title: string;
    oldPrice: string;
    markAsBestSeller: string;
    incomingRequestedOffer: string;
    shareYourThoughts: string;
    all: string;

    signInRequired: string;
    pleaseSignIn: string;
    deleteConfirmation: string;
    areYouSureDelete: string;
    newImage: string;
    cannotUndo: string;
    supportedImageFormats: string;
    updating: string;
    deleting: string;
    shareThisProduct: string;
    linkCopied: string;
    cannotTradeWithSelf: string;
    postedOn: string;
    overallRating: string;
    rating: string;
    star: string;
    stars: string;
    selectYourRating: string;
    reviewCommentPlaceholder: string;
    characters: string;
    reviewSubmitted: string;
    thankYouForReview: string;
    reviewUpdated: string;
    seeds: string;

    browseMoreProducts: string;
    reviewDeleted: string;
    editYourReview: string;
    noFavoritesYet: string;
    creating: string;
    currentPhotos: string;
    newPhotos: string;
    of: string;
    photosAdded: string;
    autoFillLocation: string;
    autoFillDescription: string;
    liveStock: string;
    uploading: string;
    trade: string;
    maximumPhotos: string;
    maximumPhotos_Product: string;
    writeAReview: string;
    shareYourExperienceWithProduct: string;
    whatYouLike: string;
    whatCouldBeImproved: string;
    reviewImagesOptional: string;
    tradeWithSelfError: string;
    organicOnly: string;
    agroecologyFriendly: string;
    geolocationNotSupported: string;
    useCurrentLocation: string;
    locationAccessDenied: string;
    gettingLocation: string;
    enterRecipientName: string;
    tradeTitlePlaceholder: string;
    product: string;
    locationPlaceholder: string;
    clickToUploadImages: string;
    uploadImages: string;
    autoFilledWithOwner: string;
    createYourFirstProduct: string;
    createYourFirstTrade: string;
    tools: string;
    youHaveNotCreated: string;
    noBestSellersAvailable: string;
    selectedImages: string;
    checkBackLater: string;
    browseAllProducts: string;
    tradeRequests: string;
    incomingRequest: string;
    outgoingRequest: string;
    allTradeRequests: string;
    recentlyRequested: string;
    noMatchingTrades: string;
    createTradeToStart: string;
    editTradeRequest: string;
    describeWhatYouWant: string;
    equipment: string;
    addMoreImages: string;
    tradeCreatedSuccess: string;
    tradeUpdatedSuccess: string;
    tradeDeletedSuccess: string;
    status: string;
    createdAt: string;
    you: string;
    categoryRequired: string;
    existingImagesWillBeRemoved: string;
    errorUpdatingStatus: string;
    deleteConfirmationMessage: string;
    errorDeletingTrade: string;
    time: string;
    tradeImage: string;
    showMore: string;
    showLess: string;
    enterProductTitle: string;
    priceMustBePositive: string;
    enterProductDescription: string;
    enterLocation: string;
    oldPriceMustBePositive: string;
  };
  learninghub: {
    guides: string;
    tutorials: string;
    resources: string;
    categories: string;
    readTime: string;
    author: string;
    searchGuides: string;
    featured: string;
    popular: string;
    recent: string;
    readGuide: string;
    removeFromFavorites: string;
    addToFavorites: string;
    calendar: string;
    noGuidesFound: string;
    noSearchResults: string;
    allCategories: string;
    soilCompost: string;
    fertilizer: string;
    plantCare: string;
    showing: string;
    searchCategories: string;
    noCategoriesFound: string;
    stories: string;
    saved: string;
    learningHub: string;
    searchPlaceholder: string;
    location: string;
    likes: string;
    readFullStory: string;
    noStoriesFound: string;
    savedGuides: string;
    savedStories: string;
    noSavedItems: string;
    noSavedGuidesFound: string;
    noSavedGuides: string;
    noSavedStoriesFound: string;
    noSavedStories: string;
    tryAdjustingSearch: string;
    startSavingGuides: string;
    startSavingStories: string;
    searching: string;
    failedToLoad: string;
    pleaseRefresh: string;
    guideNotFound: string;
    guideNotFoundDescription: string;
    backToGuides: string;
    home: string;
    stepsToFollow: string;
    tags: string;
    helpfulResources: string;
    save: string;
    storyNotFound: string;
    storyNotFoundDescription: string;
    backToStories: string;
  };
};

export const messages: Record<Language, Messages> = {
  kh: {
    common: {
      login: "ចូលប្រើប្រាស់",
      signup: "ចុះឈ្មោះ",
      email: "អ៊ីមែល",
      password: "ពាក្យសម្ងាត់",
      confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់",
      forgotPassword: "ភ្លេចពាក្យសម្ងាត់?",
      switchToLogin: "មានគណនីរួចហើយ? ចូលប្រើប្រាស់",
      switchToSignup: "មិនទាន់មានគណនី? ចុះឈ្មោះ",
      welcome: "សូមស្វាគមន៍",
      subtitle: "ចូលរួមជាមួយកសិករកម្ពុជា",
      platformDescription:
        "AgroEco ជាវេទិកាមួយដែលជួយកសិករកម្ពុជាភ្ជាប់ទំនាក់ទំនង រៀនបច្ចេកទេសកសិកម្មប្រកបដោយចីរភាព ស្វែងរកទីតាំងកសិដ្ឋាន និងជួញដូរផលិតផលនៅលើទីផ្សារតែមួយ។",
      featureMapTitle: "ផែនទីកសិដ្ឋាន",
      featureMapDesc: "រកមើល និងបង្ហោះទីតាំងកសិដ្ឋាននៅជិតអ្នក",
      featureKnowledgeTitle: "ចំណេះដឹងកសិកម្ម",
      featureKnowledgeDesc: "ការណែនាំ និងរឿងរ៉ាវអំពីកសិកម្មប្រកបដោយចីរភាព",
      featureMarketplaceTitle: "ទីផ្សារ",
      featureMarketplaceDesc: "ទិញ លក់ និងផ្លាស់ប្តូរផលិតផលកសិកម្ម",
      featureForumTitle: "វេទិកាសហគមន៍",
      featureForumDesc: "ជជែក និងចែករំលែកជាមួយកសិករផ្សេងទៀត",
      highlightsTitle: "ស្វែងយល់បន្ថែម",
      highlightsSubtitle: "ហើយនេះជាខ្លះៗដែលកំពុងកើតឡើងនៅលើ AgroEco",
      highlightMarketplaceLabel: "ទីផ្សារ",
      highlightKnowledgeLabel: "ចំណេះដឹងកសិកម្ម",
      highlightForumLabel: "វេទិកាសហគមន៍",
      newsTitle: "ព័ត៌មានថ្មីៗ",
      newsSubtitle: "បទពិសោធន៍ និងព័ត៌មានថ្មីៗពីសហគមន៍កសិករ",
      seeMore: "មើលច្រើនទៀត",
      getStarted: "ចាប់ផ្តើមឥឡូវនេះ",
      language: "ភាសា",
      darkMode: "របៀបងងឹត",
      lightMode: "របៀបពន្លឺ",
      back: "ត្រលប់ក្រោយ",
      tryAgain: "ព្យាយាមម្តងទៀត",
      next: "បន្ទាប់",
      submit: "បញ្ជូន",
      cancel: "បោះបង់",
      save: "រក្សាទុក",
      delete: "លុប",
      edit: "កែសម្រួល",
      create: "បង្កើត",
      update: "ធ្វើបច្ចុប្បន្នភាព",
      loading: "កំពុងផ្ទុក...",
      error: "កំហុស",
      success: "ជោគជ័យ",
      required: "ត្រូវការ",
      optional: "មានក៏បានអត់ក៏បាន",
      selected: "បានជ្រើសរើស",
      clickToUpload: "ចុចដើម្បីផ្ទុករូបភាព",
      addImages: "បន្ថែមរូបភាព",
      canAddMore: "អាចបន្ថែមបាន",
      moreImages: "រូបទៀត",
      uploading: "កំពុងផ្ទុក",
      creating: "កំពុងបង្កើត",
      to: "ទៅ",
      shareYourFarmWithCommunity: "ចែករំលែកកសិដ្ឋានរបស់អ្នកជាមួយសហគមន៍",
      enterFarmName: "បញ្ចូលឈ្មោះកសិដ្ឋានរបស់អ្នក",
      tellUsAboutYourFarm:
        "ប្រាប់យើងអំពីកសិដ្ឋានរបស់អ្នក សកម្មភាព និងអ្វីដែលធ្វើឱ្យវាពិសេស...",
      upTo: "រហូតដល់",
      addCrops: "បន្ថែមដំណាំ...",
      fullAddress: "អាសយដ្ឋានពេញ",
      // Add missing keys
      pleaseSignIn: "សូមចូលគណនី",
      requiredFields: "សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់",
      enterTitle: "បញ្ចូលចំណងជើង",
      enterDescription: "បញ្ចូលការពិពណ៌នា",
      selectCategory: "ជ្រើសរើសប្រភេទ",
      selectCertification: "ជ្រើសរើសវិញ្ញាបនបត្រ",
      enterLocation: "បញ្ចូលទីតាំង",
    },
    nav: {
      home: "ផ្ទះ",
      transport: "ដឹកជញ្ជូន",
      messages: "សារ",
      profile: "គណនី",
      farmMap: "ផែនទីកសិដ្ឋាន",
      createFarm: "បង្កើតកសិដ្ឋាន",
    },
    farm: {
      createFarm: "បង្កើតកសិដ្ឋានរបស់អ្នក",
      farmName: "ឈ្មោះកសិដ្ឋានរបស់អ្នក",
      farmType: "ប្រភេទកសិដ្ឋាន",
      farmAbout: "អំពីកសិដ្ឋានរបស់អ្នក",
      farmLocation: "ទីតាំងកសិដ្ឋានរបស់អ្នក",
      farmAddress: "អាសយដ្ឋានកសិដ្ឋាន",
      farmPhone: "លេខទូរស័ព្ទ",
      farmWebsite: "វេបសាយ",
      farmTelegram: "តំណភ្ជាប់ Telegram",
      growingCrops: "ដំណាំដែលកំពុងដាំ",
      certifications: "វិញ្ញាបនបត្រ",
      farmingMethods: "វិធីសាស្ត្រកសិកម្ម",
      products: "ផលិតផល",
      profileImage: "រូបភាពកសិដ្ឋាន",
      galleryImages: "រូបភាពកសិដ្ឋានផ្សេងៗ",
      addItem: "បន្ថែម",
      remove: "លុប",

      selectLocation: "ជ្រើសរើសទីតាំង",
      farmCreated: "កសិដ្ឋានត្រូវបានបង្កើតដោយជោគជ័យ!",
      farmCreationError: "មានបញ្ហាកើតឡើងក្នុងការបង្កើតកសិដ្ឋាន",
      mustLogin: "អ្នកត្រូវតែចូលគណនីដើម្បីបង្កើតកសិដ្ឋាន",
      alreadyHaveFarm: "អ្នកមានកសិដ្ឋានរួចហើយ។ អ្នកអាចកែសម្រួលព័ត៌មានបាន។",
      stepBasicInfo: "ព័ត៌មានមូលដ្ឋាន",
      stepDetails: "ព័ត៌មានលម្អិត",
      stepMediaContact: "រូបភាព",
      stepLocation: "ទីតាំង",
      all: "ទាំងអស់",
      organic: "សរីរាង្គ",
      fairTrade: "Fair Trade",
      sustainable: "ប្រកបដោយចីរភាព",
    },
    auth: {
      loginRequired: "ត្រូវការចូលគណនី",
      mustLoginToAddFarm: "អ្នកត្រូវតែចូលគណនីដើម្បីបន្ថែមកសិដ្ឋានថ្មី។",
      loginNow: "ចូលគណនី",
      createAccount: "បង្កើតគណនីថ្មី",
    },
    marketplace: {
      enterProductTitle: "សូមបញ្ចូលចំណងជើងផលិតផល",
      enterProductDescription: "សូមបញ្ចូលការពិពណ៌នាផលិតផល",
      enterLocation: "សូមបញ្ចូលទីតាំង",
      priceMustBePositive: "តម្លៃត្រូវតែជាលេខវិជ្ជមាន",
      oldPriceMustBePositive: "តម្លៃចាស់ត្រូវតែជាលេខវិជ្ជមាន",
      errorUpdatingStatus:
        "មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពបានទេ។ សូមព្យាយាមម្តងទៀត។",
      deleteConfirmationMessage:
        "តើអ្នកពិតជាចង់លុបសំណើផ្លាស់ប្តូរនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។",
      errorDeletingTrade: "មិនអាចលុបសំណើផ្លាស់ប្តូរបានទេ។ សូមព្យាយាមម្តងទៀត។",
      time: "ពេលវេលា",
      tradeImage: "រូបភាពផ្លាស់ប្តូរ",
      showMore: "បង្ហាញបន្ថែម",
      showLess: "បង្ហាញតិច",
      marketplace: "ទីផ្សារ",
      shop: "ហាង",
      trade: "ផ្លាស់ប្តូរ",
      myPosts: "ប្រកាសរបស់ខ្ញុំ",
      products: "ផលិតផល",
      pleaseUseValidImageFormats: "សូមប្រើទ្រង់ទ្រាយរូបភាពដែលត្រឹមត្រូវ",
      trades: "ការផ្លាស់ប្តូរ",
      user: "អ្នកប្រើប្រាស់",
      cannotTradeWithSelf: "អ្នកមិនអាចផ្លាស់ប្តូរជាមួយខ្លួនអ្នកបានទេ",
      moreOptions: "ជម្រើសបន្ថែម",
      cannotSendToYourself: "អ្នកមិនអាចផ្ញើសំណើទៅខ្លួនអ្នកបានទេ។",
      locationPlaceholder: "បញ្ចូលទីក្រុង ខេត្ត ឬអ្នកសម្របសម្រួល",
      tradeCreationFailed: "ការបង្កើតការផ្លាស់ប្តូរបរាជ័យ",
      bestSeller: "លក់ដាច់ជាងគេ",
      enterTradeTitle: "បញ្ចូលចំណងជើងការផ្លាស់ប្តូរ",
      pleaseSignInToViewTrades: "សូមចូលគណនីដើម្បីមើលការផ្លាស់ប្តូរ",
      found: "រកឃើញ",
      tradeRequest: "សំណើផ្លាស់ប្តូរ",
      imageUploadFailed: "ការផ្ទុករូបភាពបរាជ័យ",
      autoFillLocation: "បំពេញទីតាំងដោយស្វ័យប្រវត្តិ",
      autoFillDescription: "បំពេញទីតាំងដោយស្វ័យប្រវត្តិពេលស្វែងរក",
      for: "សម្រាប់",
      completeAllRequiredFields: "សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់។",
      tryDifferentSearch: "ព្យាយាមស្វែងរកផ្សេងទៀត",
      tradeRequestsMustBeSentToOthers:
        "សំណើផ្លាស់ប្តូរត្រូវតែផ្ញើទៅអ្នកប្រើប្រាស់ផ្សេងទៀត។",
      newImage: "រូបភាពថ្មី",
      allProducts: "ផលិតផលទាំងអស់",
      createProduct: "បង្កើតផលិតផល",
      showing: "បង្ហាញ:",
      filteredResults: "លទ្ធផលដែលបានតម្រង",
      updateTrade: "ធ្វើបច្ចុប្បន្នភាពការផ្លាស់ប្តូរ",
      newImagesToAdd: "រូបភាពថ្មីដែលត្រូវបន្ថែម",
      noProductsMatch:
        "រកមិនឃើញផលិតផលដែលត្រូវគ្នានឹងការស្វែងរក ឬតម្រងរបស់អ្នកទេ។",
      filterModal: "ប្រអប់តម្រង",
      reset: "កំណត់ឡើងវិញ",
      selectedImages: "រូបភាពដែលបានជ្រើសរើស",
      createTrade: "បង្កើតការផ្លាស់ប្តូរ",
      currentImages: "រូបភាពបច្ចុប្បន្ន",
      productDetails: "ព័ត៌មានលម្អិតអំពីផលិតផល",
      uploading: "កំពុងផ្ទុក...",
      price: "តម្លៃ",
      uploadImages: "ផ្ទុករូបភាព",
      description: "ការពិពណ៌នា",
      location: "ទីតាំង",
      categories: "ប្រភេទ",
      all: "ទាំងអស់",
      seeds: "គ្រាប់ពូជ",
      tools: "ឧបករណ៍",
      equipment: "បរិក្ខារ",
      product: "ផលិតផល",
      liveStock: "សត្វចិញ្ចឹម",
      posted: "បានបង្ហោះ",
      clickToUploadImages: "ចុចដើម្បីផ្ទុករូបភាព",
      tradeTitlePlaceholder: "បញ្ចូលចំណងជើងការផ្លាស់ប្តូរ",
      maximumFileSize: "ទំហំឯកសារអតិបរមា",

      seller: "អ្នកលក់",
      updateReview: "កែប្រែការវាយតម្លៃ",
      existingImage: "រូបភាពដែលមានស្រាប់",
      myFavorites: "ចំណូលចិត្តរបស់ខ្ញុំ",
      supportedImageFormats: "ទ្រង់ទ្រាយរូបភាពដែលគាំទ្រ: JPG, PNG, GIF",
      someFavoritesUnavailable: "ចំណូលចិត្តមួយចំនួនមិនអាចប្រើប្រាស់បាន",
      noFavoritesYet: "មិនទាន់មានចំណូលចិត្ត",
      favoritesRemovedBySeller:
        "ផលិតផលខ្លះនៅក្នុងចំណូលចិត្តរបស់អ្នកអាចត្រូវបានលុបដោយអ្នកលក់។",
      favoritesEmptyDescription:
        "ផលិតផលដែលអ្នកចូលចិត្តនឹងបង្ហាញនៅទីនេះ។ ចាប់ផ្តើមស្វែងរកដើម្បីរកអ្វីដែលអ្នកចូលចិត្ត!",
      browseMoreProducts: "មើលផលិតផលបន្ថែម",
      startShopping: "ចាប់ផ្តើមទិញ",
      creating: "កំពុងបង្កើត...",
      provideRatingAndComment: "សូមផ្តល់ការវាយតម្លៃ និងមតិ",
      reviewCommentMaxLength: "មតិរបស់អ្នកមិនអាចលើសពី ១០០០ តួអក្សរបានទេ",
      amazingProduct: "ផលិតផលដ៏អស្ចារ្យ",
      checkOutThisProduct: "សូមមើលផលិតផលនេះ",
      productNotFound: "រកមិនឃើញផលិតផល",
      anonymous: "អនាមិក",

      sellerInformation: "ព័ត៌មានអ្នកលក់",
      reviews: "ការវាយតម្លៃ",
      customerReviews: "ការវាយតម្លៃពីអតិថិជន",
      writeReview: "សរសេរការវាយតម្លៃ",
      submitReview: "បញ្ជូនការវាយតម្លៃ",
      editReview: "កែសម្រួលការវាយតម្លៃ",
      deleteReview: "លុបការវាយតម្លៃ",
      share: "ចែករំលែក",
      addToCart: "បន្ថែមទៅកន្ត្រក",
      addToFavorites: "បន្ថែមទៅចំណូលចិត្ត",
      createTradeRequest: "បង្កើតសំណើផ្លាស់ប្តូរ",
      tradeTitle: "ចំណងជើងការផ្លាស់ប្តូរ",
      tradeDescription: "ការពិពណ៌នាអំពីការផ្លាស់ប្តូរ",
      toUser: "ទៅកាន់អ្នកប្រើប្រាស់",
      accept: "ទទួលយក",
      organicOnly: "សិរីរាង្គសុទ្ធ",
      agroecologyFriendly: "កសិបរិស្ថានល្អ",
      geolocationNotSupported:
        "កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រការស្វែងរកទីតាំងទេ។",
      locationAccessDenied:
        "មិនអាចចូលដំណើរការទីតាំងបានទេ។ សូមពិនិត្យការអនុញ្ញាតទីតាំងរបស់អ្នក។",
      gettingLocation: "កំពុងស្វែងរកទីតាំង...",
      decline: "បដិសេធ",
      pending: "កំពុងរង់ចាំ",
      accepted: "បានទទួលយក",
      declined: "បានបដិសេធ",
      completed: "បានបញ្ចប់",
      filter: "តម្រង",
      filters: "តម្រង",
      category: "ប្រភេទ",
      certification: "វិញ្ញាបនបត្រ",
      priceRange: "ចន្លោះតម្លៃ",
      minPrice: "តម្លៃទាបបំផុត",
      maxPrice: "តម្លៃខ្ពស់បំផុត",
      tradeUpdateFailed: "ការធ្វើបច្ចុប្បន្នភាពការផ្លាស់ប្តូរបរាជ័យ",
      resetFilters: "កំណត់តម្រងឡើងវិញ",
      applyFilters: "អនុវត្តតម្រង",
      searchProducts: "ស្វែងរកផលិតផល...",
      searchTrades: "ស្វែងរកការផ្លាស់ប្តូរ...",
      noProducts: "មិនមានផលិតផល",
      noTrades: "មិនមានការផ្លាស់ប្តូរ",
      loading: "កំពុងផ្ទុក...",
      seeAll: "មើលទាំងអស់",
      yourRating: "ការវាយតម្លៃរបស់អ្នក",
      yourReview: "ការវាយតម្លៃរបស់អ្នក",
      shareYourExperience: "ចែករំលែកបទពិសោធន៍របស់អ្នក",
      addPhotos: "បន្ថែមរូបភាព",
      signInToReview: "ចូលគណនីដើម្បីវាយតម្លៃ",
      alreadyReviewed: "អ្នកបានវាយតម្លៃរួចហើយ។",
      useCurrentLocation: "ប្រើទីតាំងបច្ចុប្បន្ន",
      noReviewsYet: "មិនទាន់មានការវាយតម្លៃ",
      beTheFirst: "វាយតម្លៃជាអ្នកដំបូង!",
      showAllReviews: "បង្ហាញការវាយតម្លៃទាំងអស់",
      showLessReviews: "បង្ហាញតិចជាងនេះ",
      chat: "ជជែក",
      signInToTrade: "ចូលគណនីដើម្បីផ្លាស់ប្តូរ",
      yourProduct: "ផលិតផលរបស់អ្នក",
      images: "រូបភាព",
      title: "ចំណងជើង",
      oldPrice: "តម្លៃចាស់",
      markAsBestSeller: "សម្គាល់ថាលក់ដាច់ជាងគេ",
      incomingRequestedOffer: "ការផ្តល់ជូនដែលបានស្នើសុំចូល",
      shareYourThoughts: "ចែករំលែកគំនិតរបស់អ្នក",
      signInRequired: "ត្រូវការចូលគណនី",
      pleaseSignIn: "សូមចូលគណនី",
      deleteConfirmation: "បញ្ជាក់ការលុប",
      areYouSureDelete: "តើអ្នកពិតជាចង់លុបនេះមែនទេ?",
      cannotUndo: "សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។",
      updating: "កំពុងធ្វើបច្ចុប្បន្នភាព...",
      deleting: "កំពុងលុប...",
      shareThisProduct: "ចែករំលែកផលិតផលនេះ",
      linkCopied: "បានចម្លងតំណ",
      postedOn: "បានបង្ហោះនៅ",
      overallRating: "ការវាយតម្លៃសរុប",
      rating: "ការវាយតម្លៃ",
      star: "ផ្កាយ",
      stars: "ផ្កាយ",
      selectYourRating: "ជ្រើសរើសការវាយតម្លៃរបស់អ្នក",
      reviewCommentPlaceholder:
        "ចែករំលែកបទពិសោធន៍របស់អ្នកជាមួយផលិតផលនេះ។ តើអ្នកចូលចិត្តអ្វីខ្លះ? តើអ្វីដែលអាចកែលម្អបាន?",
      characters: "តួអក្សរ",
      reviewSubmitted: "ការវាយតម្លៃត្រូវបានបញ្ជូន",
      thankYouForReview: "សូមអរគុណសម្រាប់ការវាយតម្លៃរបស់អ្នក!",
      reviewUpdated: "ការវាយតម្លៃត្រូវបានធ្វើបច្ចុប្បន្នភាព",
      reviewDeleted: "ការវាយតម្លៃត្រូវបានលុប",
      editYourReview: "កែសម្រួលការវាយតម្លៃរបស់អ្នក",
      currentPhotos: "រូបភាពបច្ចុប្បន្ន",
      newPhotos: "រូបភាពថ្មី",
      of: "នៃ",
      photosAdded: "រូបភាពត្រូវបានបន្ថែម",
      maximumPhotos: "រូបភាពអតិបរមា ៥ ត្រូវបានអនុញ្ញាត",
      maximumPhotos_Product: "រូបភាពអតិបរមា 3 ត្រូវបានអនុញ្ញាត",
      writeAReview: "សរសេរការវាយតម្លៃ",
      shareYourExperienceWithProduct: "ចែករំលែកបទពិសោធន៍របស់អ្នកជាមួយផលិតផលនេះ",
      whatYouLike: "តើអ្នកចូលចិត្តអ្វីខ្លះ?",
      whatCouldBeImproved: "តើអ្វីដែលអាចកែលម្អបាន?",
      reviewImagesOptional:
        "បន្ថែមរូបភាពដើម្បីបង្ហាញបទពិសោធន៍របស់អ្នកជាមួយផលិតផល (មិនចាំបាច់)",
      tradeWithSelfError:
        "អ្នកមិនអាចបង្កើតសំណើផ្លាស់ប្តូរជាមួយខ្លួនអ្នកបានទេ។ សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ផ្សេង។",
      enterRecipientName: "បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ពិតប្រាកដរបស់អ្នកទទួល",
      autoFilledWithOwner: "បានបំពាក់ដោយស្វ័យប្រវត្តិជាមួយឈ្មោះម្ចាស់ផលិតផល",
      createYourFirstProduct: "បង្កើតផលិតផលដំបូងរបស់អ្នក",
      createYourFirstTrade: "បង្កើតការផ្លាស់ប្តូរដំបូងរបស់អ្នក",
      youHaveNotCreated: "អ្នកមិនទាន់បានបង្កើត",
      noBestSellersAvailable: "មិនមានផលិតផលលក់ដាច់ជាងគេ",
      checkBackLater:
        "ត្រលប់មកវិញនៅពេលក្រោយដើម្បីស្វែងរកផលិតផលលក់ដាច់ជាងគេរបស់យើង។",
      browseAllProducts: "មើលផលិតផលទាំងអស់",
      tradeRequests: "សំណើផ្លាស់ប្តូរ",
      incomingRequest: "សំណើចូល",
      outgoingRequest: "សំណើចេញ",
      allTradeRequests: "សំណើផ្លាស់ប្តូរទាំងអស់",
      recentlyRequested: "បានស្នើថ្មីៗ",
      noMatchingTrades: "រកមិនឃើញសំណើផ្លាស់ប្តូរដែលត្រូវគ្នា",
      createTradeToStart: "បង្កើតសំណើផ្លាស់ប្តូរដើម្បីចាប់ផ្តើម",
      editTradeRequest: "កែសម្រួលសំណើផ្លាស់ប្តូរ",
      describeWhatYouWant: "ពិពណ៌នាអំពីអ្វីដែលអ្នកចង់ផ្លាស់ប្តូរ...",
      addMoreImages: "បន្ថែមរូបភាពបន្ថែម",
      tradeCreatedSuccess: "សំណើផ្លាស់ប្តូរត្រូវបានបង្កើតដោយជោគជ័យ!",
      tradeUpdatedSuccess:
        "សំណើផ្លាស់ប្តូរត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!",
      tradeDeletedSuccess: "សំណើផ្លាស់ប្តូរត្រូវបានលុបដោយជោគជ័យ!",
      status: "ស្ថានភាព",
      createdAt: "បានបង្កើតនៅ",
      you: "អ្នក",
      // Add missing keys
      categoryRequired: "ត្រូវការជ្រើសរើសប្រភេទ",
      existingImagesWillBeRemoved: "រូបភាពដែលមានស្រាប់នឹងត្រូវលុប",
    },
    learninghub: {
      guides: "ការណែនាំ",
      tutorials: "មេរៀន",
      resources: "ធនធាន",
      categories: "ប្រភេទ",
      readTime: "ពេលវេលាអាន",
      author: "អ្នកនិពន្ធ",
      searchGuides: "ស្វែងរកការណែនាំ...",
      featured: "ពិសេស",
      popular: "ពេញនិយម",
      recent: "ថ្មីៗ",
      readGuide: "អានការណែនាំ",
      removeFromFavorites: "ដកចេញពីចំណូលចិត្ត",
      addToFavorites: "បន្ថែមទៅចំណូលចិត្ត",
      calendar: "ប្រតិទិន",
      noGuidesFound: "រកមិនឃើញប្រភេទដែលបានជ្រើសរើសទេ។",
      noSearchResults: "រកមិនឃើញការស្វែងរកនេះទេ។",
      allCategories: "ប្រភេទទាំងអស់",
      soilCompost: "ដី និងជីកំប៉ុស",
      fertilizer: "ជី",
      plantCare: "ការថែរក្សាដំណាំ",
      searchCategories: "ស្វែងរកប្រភេទ...",
      noCategoriesFound: "រកមិនឃើញប្រភេទ",
      stories: "រឿងរ៉ាវ",
      saved: "រក្សាទុក",
      learningHub: "មជ្ឈមណ្ឌលចំណេះដឹង",
      searchPlaceholder: "ស្វែងរក...",
      location: "ទីតាំង",
      likes: "ចូលចិត្ត",
      showing: "បង្ហាញ:",
      readFullStory: "អានរឿងពេញ",
      noStoriesFound: "រកមិនឃើញរឿងរ៉ាវ",
      savedGuides: "ការណែនាំបានរក្សាទុក",
      savedStories: "រឿងរ៉ាវបានរក្សាទុក",
      noSavedItems: "អ្នកមិនទាន់រក្សាទុកការណែនាំ ឬរឿងរ៉ាវណាមួយទេ។",
      failedToLoad: "បរាជ័យក្នុងការផ្ទុកមាតិកា",
      pleaseRefresh: "សូមព្យាយាមផ្ទុកទំព័រឡើងវិញ",
      noSavedGuidesFound: "រកមិនឃើញការណែនាំដែលបានរក្សាទុក",
      noSavedGuides: "មិនទាន់មានការណែនាំដែលបានរក្សាទុក",
      noSavedStoriesFound: "រកមិនឃើញរឿងរ៉ាវដែលបានរក្សាទុក",
      noSavedStories: "មិនទាន់មានរឿងរ៉ាវដែលបានរក្សាទុក",
      tryAdjustingSearch: "សូមព្យាយាមកែសម្រួលលក្ខខណ្ឌស្វែងរករបស់អ្នក",
      startSavingGuides: "ចាប់ផ្តើមរក្សាទុកការណែនាំដើម្បីមើលពួកវានៅទីនេះ",
      startSavingStories: "ចាប់ផ្តើមរក្សាទុករឿងរ៉ាវដើម្បីមើលពួកវានៅទីនេះ",
      searching: "កំពុងស្វែងរក...",
      guideNotFound: "រកមិនឃើញការណែនាំ",
      guideNotFoundDescription:
        "ការណែនាំដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ទី។",
      backToGuides: "ត្រលប់ទៅការណែនាំ",
      home: "ទំព័រដើម",
      stepsToFollow: "ជំហានដែលត្រូវធ្វើតាម",
      tags: "ស្លាក",
      helpfulResources: "ធនធានដែលមានប្រយោជន៍",
      save: "រក្សាទុក",
      storyNotFound: "រកមិនឃើញរឿងរ៉ាវ",
      storyNotFoundDescription:
        "រឿងរ៉ាវដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ទី។",
      backToStories: "ត្រលប់ទៅរឿងរ៉ាវ",
    },
  },
  en: {
    common: {
      login: "Login",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot password?",
      switchToLogin: "Already have an account? Login",
      switchToSignup: "Don't have an account? Sign up",
      welcome: "Welcome",
      subtitle: "Join Cambodian Farmers Community",
      platformDescription:
        "AgroEco connects Cambodian farmers to share knowledge on sustainable farming, discover farms near you, and trade products all in one platform.",
      featureMapTitle: "Farm Map",
      featureMapDesc: "Discover and list farms near you",
      featureKnowledgeTitle: "Farming Knowledge",
      featureKnowledgeDesc: "Guides and stories on sustainable agriculture",
      featureMarketplaceTitle: "Marketplace",
      featureMarketplaceDesc: "Buy, sell, and trade farm products",
      featureForumTitle: "Community Forum",
      featureForumDesc: "Chat and connect with other farmers",
      highlightsTitle: "Discover More",
      highlightsSubtitle: "Here's what's happening on AgroEco right now",
      highlightMarketplaceLabel: "Marketplace",
      highlightKnowledgeLabel: "Farming Knowledge",
      highlightForumLabel: "Community Forum",
      newsTitle: "Latest News",
      newsSubtitle: "Stories and updates from the farming community",
      seeMore: "See More",
      getStarted: "Get Started",
      language: "Language",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      back: "Back",
      next: "Next",
      submit: "Submit",
      cancel: "Cancel",
      tryAgain: "Try again",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      update: "Update",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      required: "Required",
      optional: "Optional",
      selected: "Selected",
      clickToUpload: "Click to upload image",
      addImages: "Add images",
      canAddMore: "Can add",
      moreImages: "more images",
      uploading: "Uploading",
      creating: "Creating",
      to: "to",
      shareYourFarmWithCommunity: "Share your farm with the community",
      enterFarmName: "Enter your farm name",
      tellUsAboutYourFarm:
        "Tell us about your farm, activities, and what makes it special...",
      upTo: "up to",
      addCrops: "Add crops...",
      fullAddress: "Full address",
      // Add missing keys
      pleaseSignIn: "Please sign in",
      requiredFields: "Please fill in all required fields",
      enterTitle: "Enter title",
      enterDescription: "Enter description",
      selectCategory: "Select category",
      selectCertification: "Select certification",
      enterLocation: "Enter location",
    },
    nav: {
      home: "Home",
      transport: "Transport",
      messages: "Messages",
      profile: "Profile",
      farmMap: "Farm Map",
      createFarm: "Create Farm",
    },
    farm: {
      createFarm: "Create Your Farm",
      farmName: "Your Farm Name",
      farmType: "Farm Type",
      farmAbout: "About Your Farm",
      farmLocation: "Your Farm Location",
      farmAddress: "Farm Address",
      farmPhone: "Phone Number",
      farmWebsite: "Website",
      farmTelegram: "Telegram Link",
      growingCrops: "Growing Crops",
      certifications: "Certifications",
      farmingMethods: "Farming Methods",
      products: "Products",
      profileImage: "Farm Profile Image",
      galleryImages: "Farm Gallery Images",
      addItem: "Add",
      remove: "Remove",
      selectLocation: "Select Location",
      farmCreated: "Farm created successfully!",
      farmCreationError: "Error creating farm",
      mustLogin: "You must be logged in to create a farm",
      alreadyHaveFarm:
        "You already have a farm. You can edit your information.",
      stepBasicInfo: "Basic",
      stepDetails: "Detailed",
      stepMediaContact: "Media",
      stepLocation: "Location",
      all: "All",
      organic: "Organic",
      fairTrade: "Fair Trade",
      sustainable: "Sustainable",
    },
    auth: {
      loginRequired: "Login Required",
      mustLoginToAddFarm: "You must be logged in to add a new farm.",
      loginNow: "Login Now",
      createAccount: "Create New Account",
    },
    marketplace: {
      enterProductTitle: "Please enter a product title",
      enterProductDescription: "Please enter a product description",
      enterLocation: "Please enter a location",
      priceMustBePositive: "Price must be a positive number",
      oldPriceMustBePositive: "Old price must be a positive number",
      errorUpdatingStatus: "Failed to update trade status. Please try again.",
      deleteConfirmationMessage:
        "Are you sure you want to delete this trade request? This action cannot be undone.",
      errorDeletingTrade: "Failed to delete trade request. Please try again.",
      time: "Time",
      tradeImage: "Trade image",
      showMore: "Show more",
      showLess: "Show less",
      marketplace: "Marketplace",
      shop: "Shop",
      trade: "Trade",
      updateReview: "Update Review",
      myPosts: "My Posts",
      bestSeller: "Best Seller",
      allProducts: "All Products",
      createProduct: "Create Product",
      updateTrade: "Update Trade",
      createTrade: "Create Trade",
      cannotSendToYourself: "You cannot send a request to yourself.",
      productDetails: "Product Details",
      pleaseUseValidImageFormats: "Please use valid image formats",
      price: "Price",
      uploadImages: "Upload Images",
      completeAllRequiredFields: "Please complete all required fields.",
      description: "Description",
      tradeUpdateFailed: "Trade update failed",
      maximumFileSize: "Maximum file size",
      newImage: "New Image",
      clickToUploadImages: "Click to upload images",
      location: "Location",
      posted: "Posted",
      enterTradeTitle: "Enter trade title",
      currentImages: "Current Images",
      existingImage: "Existing Image",
      reset: "Reset",
      filterModal: "Filter Modal",
      products: "Products",
      showing: "Showing:",
      filteredResults: "Filtered Results",

      noProductsMatch: "No products match your search or filters.",
      trades: "Trades",
      moreOptions: "More Options",
      tradeTitlePlaceholder: "Enter trade title",
      user: "User",
      creating: "Creating...",
      all: "All",
      supportedImageFormats: "Supported image formats: JPG, PNG, GIF",
      seller: "Seller",
      pleaseSignInToViewTrades: "Please sign in to view trades",
      found: "found",
      useCurrentLocation: "Use current location",
      cannotTradeWithSelf: "You cannot trade with yourself",
      seeds: "Seeds",
      tools: "Tools",
      equipment: "Equipment",

      liveStock: "Live Stock",
      tradeCreationFailed: "Trade creation failed",
      tradeRequestsMustBeSentToOthers:
        "Trade requests must be sent to other users.",
      tradeRequest: "trade request",
      for: "for",
      tryDifferentSearch: "Try a different search",
      selectedImages: "Selected Images",
      imageUploadFailed: "Image upload failed",
      provideRatingAndComment: "Please provide a rating and comment",
      reviewCommentMaxLength: "Your comment cannot exceed 1000 characters",
      amazingProduct: "Amazing product",
      checkOutThisProduct: "Check out this product",
      productNotFound: "Product not found",
      newImagesToAdd: "New images to add",
      anonymous: "Anonymous",
      sellerInformation: "Seller Information",
      reviews: "Reviews",
      myFavorites: "My Favorites",
      someFavoritesUnavailable: "Some favorites are unavailable",
      locationPlaceholder: "Enter city, province or coordinator",
      noFavoritesYet: "No favorites yet",
      favoritesRemovedBySeller:
        "Some of your favorite items may have been removed by the seller.",
      favoritesEmptyDescription:
        "Products you like will appear here. Start exploring to find something you love!",
      browseMoreProducts: "Browse More Products",
      startShopping: "Start Shopping",
      customerReviews: "Customer Reviews",
      writeReview: "Write Review",
      submitReview: "Submit Review",
      editReview: "Edit Review",
      deleteReview: "Delete Review",
      share: "Share",
      addToCart: "Add to Cart",
      addToFavorites: "Add to Favorites",
      createTradeRequest: "Create Trade Request",
      tradeTitle: "Trade Title",
      tradeDescription: "Trade Description",
      toUser: "To User",
      accept: "Accept",
      decline: "Decline",
      pending: "Pending",
      uploading: "Uploading",
      accepted: "Accepted",
      declined: "Declined",
      organicOnly: "Organic Only",
      agroecologyFriendly: "Agroecology Friendly",
      completed: "Completed",
      filter: "Filter",
      filters: "Filters",
      category: "Category",
      categories: "Categories",
      certification: "Certification",
      priceRange: "Price Range",
      minPrice: "Min Price",
      maxPrice: "Max Price",
      geolocationNotSupported: "Your browser does not support geolocation.",
      locationAccessDenied:
        "Could not access location. Please check your location permissions.",
      gettingLocation: "Getting location...",
      resetFilters: "Reset Filters",
      applyFilters: "Apply Filters",
      searchProducts: "Search products...",
      searchTrades: "Search trades...",
      noProducts: "No products",
      noTrades: "No trades",
      loading: "Loading...",
      seeAll: "See All",
      yourRating: "Your Rating",
      yourReview: "Your Review",
      shareYourExperience: "Share Your Experience",
      addPhotos: "Add Photos",
      signInToReview: "Sign in to submit a review",
      alreadyReviewed: "You've already reviewed this product.",
      noReviewsYet: "No Reviews Yet",
      beTheFirst: "Be the first to share your thoughts about this product!",
      showAllReviews: "Show All Reviews",
      showLessReviews: "Show Less Reviews",
      chat: "Chat",
      signInToTrade: "Sign In to Trade",
      yourProduct: "Your Product",
      images: "Images",
      autoFillLocation: "Auto-fill Location",
      autoFillDescription: "Automatically fill location when found",
      title: "Title",
      oldPrice: "Old Price",
      markAsBestSeller: "Mark as Best Seller",
      incomingRequestedOffer: "Incoming requested offer:",
      shareYourThoughts:
        "Share your thoughts to help other customers make informed decisions!",
      signInRequired: "Sign In Required",
      pleaseSignIn: "Please sign in to",
      deleteConfirmation: "Delete Confirmation",
      areYouSureDelete: "Are you sure you want to delete this?",
      cannotUndo: "This action cannot be undone.",
      updating: "Updating...",
      deleting: "Deleting...",
      shareThisProduct: "Share this product",
      linkCopied: "Link copied to clipboard",
      postedOn: "Posted on",
      overallRating: "Overall Rating",
      rating: "Rating",
      star: "star",
      stars: "stars",
      selectYourRating: "Select your rating",
      reviewCommentPlaceholder:
        "Share your experience with this product. What did you like? What could be improved?",
      characters: "characters",
      reviewSubmitted: "Review submitted",
      thankYouForReview: "Thank you for your review!",
      reviewUpdated: "Review updated successfully!",
      reviewDeleted: "Review deleted successfully!",
      editYourReview: "Edit Your Review",
      currentPhotos: "Current Photos",
      newPhotos: "New Photos",
      of: "of",
      photosAdded: "photos added",
      maximumPhotos: "Maximum 5 photos allowed",
      maximumPhotos_Product: "Maximum 3 photos allowed",
      writeAReview: "Write a Review",
      shareYourExperienceWithProduct: "Share your experience with this product",
      whatYouLike: "What did you like?",
      whatCouldBeImproved: "What could be improved?",
      reviewImagesOptional:
        "Add photos to show your experience with the product (optional)",
      tradeWithSelfError:
        "You cannot create a trade request with yourself. Please enter a different user's name.",
      enterRecipientName: "Enter the exact user name of the user",
      autoFilledWithOwner: "Auto-filled with product owner's name",
      createYourFirstProduct: "Create Your First Product",
      createYourFirstTrade: "Create Your First Trade",
      youHaveNotCreated: "You have not created any",
      noBestSellersAvailable: "No Best Sellers Available",
      checkBackLater: "Check back later to discover our top-selling products.",
      browseAllProducts: "Browse All Products",
      tradeRequests: "Trade Requests",
      incomingRequest: "Incoming Request",
      outgoingRequest: "Outgoing Request",
      allTradeRequests: "All Trade Requests",
      recentlyRequested: "Recently Requested",
      noMatchingTrades: "No matching trade requests found",
      createTradeToStart: "Create a trade request to get started",
      editTradeRequest: "Edit Trade Request",
      describeWhatYouWant: "Describe what you want to trade...",
      addMoreImages: "Add more images",
      tradeCreatedSuccess: "Trade request created successfully!",
      tradeUpdatedSuccess: "Trade request updated successfully!",
      tradeDeletedSuccess: "Trade request deleted successfully!",
      status: "Status",
      createdAt: "Created at",
      you: "You",
      // Add missing keys
      categoryRequired: "Category is required",
      product: "Product",
      existingImagesWillBeRemoved: "existing images will be removed",
    },
    learninghub: {
      guides: "Guides",
      tutorials: "Tutorials",
      resources: "Resources",
      categories: "Categories",
      readTime: "Read time",
      author: "Author",
      searchGuides: "Search guides...",
      featured: "Featured",
      popular: "Popular",
      recent: "Recent",
      readGuide: "Read Guide",
      removeFromFavorites: "Remove from favorites",
      addToFavorites: "Add to favorites",
      calendar: "Calendar",
      noGuidesFound: "No guides found for the selected category.",
      noSearchResults: "No guides found for this search.",
      allCategories: "All Categories",
      soilCompost: "Soil & Compost",
      fertilizer: "Fertilizer",
      plantCare: "Plant Care",
      showing: "Showing",
      searchCategories: "Search categories...",
      noCategoriesFound: "No categories found",
      stories: "Stories",
      saved: "Saved",
      learningHub: "Learning Hub",
      searchPlaceholder: "Search...",
      location: "Location",
      likes: "Likes",
      readFullStory: "Read Full Story",
      noStoriesFound: "No stories found",
      savedGuides: "Saved Guides",
      savedStories: "Saved Stories",
      noSavedItems: "You haven't saved any guides or stories yet.",
      failedToLoad: "Failed to load content",
      pleaseRefresh: "Please try refreshing the page",
      noSavedGuidesFound: "No saved guides found",
      noSavedGuides: "No saved guides yet",
      noSavedStoriesFound: "No saved stories found",
      noSavedStories: "No saved stories yet",
      tryAdjustingSearch: "Try adjusting your search terms",
      startSavingGuides: "Start saving guides to see them here",
      startSavingStories: "Start saving stories to see them here",
      searching: "Searching...",
      guideNotFound: "Guide Not Found",
      guideNotFoundDescription:
        "The guide you are looking for does not exist or has been moved.",
      backToGuides: "Back to Guides",
      home: "Home",
      stepsToFollow: "Steps to Follow",
      tags: "Tags",
      helpfulResources: "Helpful Resources",
      save: "Save",
      storyNotFound: "Story Not Found",
      storyNotFoundDescription:
        "The story you are looking for does not exist or has been moved.",
      backToStories: "Back to Stories",
    },
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Messages["common"]) => string;
  tNav: (key: keyof Messages["nav"]) => string;
  tFarm: (key: keyof Messages["farm"]) => string;
  tAuth: (key: keyof Messages["auth"]) => string;
  tMarketplace: (key: keyof Messages["marketplace"]) => string;
  tLearninghub: (key: keyof Messages["learninghub"]) => string;
  switchLanguage: () => void;
  languageName: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("kh");

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("preferred-language") as Language;
    if (savedLang && (savedLang === "kh" || savedLang === "en")) {
      setLang(savedLang);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("preferred-language", lang);
  }, [lang]);

  const switchLanguage = () => {
    setLang((currentLang) => (currentLang === "kh" ? "en" : "kh"));
  };

  const languageName = lang === "kh" ? "ភាសាខ្មែរ" : "English";

  const t = (key: keyof Messages["common"]) => messages[lang].common[key];
  const tNav = (key: keyof Messages["nav"]) => messages[lang].nav[key];
  const tFarm = (key: keyof Messages["farm"]) => messages[lang].farm[key];
  const tAuth = (key: keyof Messages["auth"]) => messages[lang].auth[key];
  const tMarketplace = (key: keyof Messages["marketplace"]) =>
    messages[lang].marketplace[key];
  const tLearninghub = (key: keyof Messages["learninghub"]) =>
    messages[lang].learninghub[key];

  return (
    <I18nContext.Provider
      value={{
        lang,
        setLang,
        t,
        tNav,
        tFarm,
        tAuth,
        tMarketplace,
        tLearninghub,
        switchLanguage,
        languageName,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslations must be used inside I18nProvider");
  return ctx;
}
