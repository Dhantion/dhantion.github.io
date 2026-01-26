export const CONTENT = {
    // PASSENGER PAGES
    passenger_home: {
        welcome_message: "Hello Deneme",
        pickup_label: "Pickup Location",
        destination_label: "Destination",
        select_pickup: "Select Pickup...",
        select_destination: "Select Destination...",
        request_button: "Request Ride",
        looking_for_driver: "Looking for drivers...",
        driver_accepted: "Driver Accepted!",
        driver_on_way: "Driver is on the way.",
        rate_driver: "Driver:", // Used in "Driver: [Name]"
        ride_in_progress: "Ride in Progress",
        now_riding_with: "Now you are riding with",
        heading_to: "Heading to",
        arrived_message: "You arrived! 🎉",
        completed_message: "Ride completed successfully.",
        thank_you: "Thank you for riding with BilStop! 🌟", // New
        new_ride_button: "Request New Ride",
        cancel_request: "Cancel Request"
    },

    // DRIVER PAGES
    driver_home: {
        welcome_message: "Hello",
        ride_active: "Ride Active",
        passenger_label: "Passenger:",
        go_to_pickup: "Go to pickup location:",
        start_trip_button: "Start Trip",
        driving_label: "Driving...",
        with_label: "With:",
        end_trip_button: "End Trip",
        trip_finished: "Trip Finished",
        great_job: "Great job!",
        thank_you: "Thank you for driving with BilStop! 🌟", // New
        back_to_queue: "Back to Queue",
        active_requests_title: "Currently Active Requests",
        no_requests_title: "No Active Requests",
        waiting_text: "Waiting for passengers...",
        new_request_title: "New Ride Request!",
        pickup_strong: "Pickup:",
        dropoff_strong: "Dropoff:",
        passenger_strong: "Passenger:",
        accept_button: "Accept Ride",
        decline_button: "Decline"
    },

    // PROFILE PAGES
    profile: {
        my_profile: "My Profile",
        driver_profile: "Driver Profile 🚕",
        role_label: "Role",
        member_since: "Member Since",
        total_rides: "TOTAL RIDES",
        loading: "Loading...",
        sign_out: "Sign Out",
        logout: "Logout"
    },

    // HISTORY PAGE
    history: {
        my_trip_history: "Geçmiş Sürüşlerim",
        earnings_history: "Geçmiş Sürüşlerim",
        no_trips: "Henüz geçmiş sürüş yok.",
        driver_prefix: "Driver:",
        passenger_prefix: "Passenger:",
        unknown: "Unknown"
    },

    // AUTH PAGES (Login/Register)
    auth: {
        app_name: "BilStop",
        sign_in_subtitle: "Sign in to continue",
        create_account_subtitle: "Create your account",
        email_label: "Email Address",
        password_label: "Password",
        name_label: "Full Name",
        login_button: "Log In",
        register_button: "Register",
        i_want_to_be: "I want to be a...",
        passenger_role: "Passenger",
        driver_role: "Driver",
        dont_have_account: "Don't have an account?",
        already_have_account: "Already have an account?",
        sign_up_link: "Sign up",
        log_in_link: "Log in",

        // Errors
        error_invalid_cred: "Hatalı email veya şifre.",
        error_too_many: "Çok fazla başarısız deneme. Lütfen biraz bekleyin.",
        error_email_in_use: "Bu email adresi zaten kullanımda.",
        error_weak_pass: "Şifre çok zayıf (en az 6 karakter).",
        error_generic_login: "Giriş başarısız. Lütfen tekrar deneyin.",
        error_generic_register: "Kayıt başarısız. Lütfen tekrar deneyin."
    },

    // COLOR THEMES
    COLORS: {
        // Backgrounds
        passenger_bg: 'linear-gradient(180deg, #000000 0%, #8E2DE2 100%)',   // Black -> Purple
        driver_bg: 'linear-gradient(180deg, #ff416c 0%, #000000 100%)',   // Pink -> Black

        // Cards
        card_bg: '#222',
        card_border: '#333',

        // Text
        text_primary: '#fff',
        text_secondary: '#aaa',
        text_highlight_blue: '#00f2fe',
        text_highlight_purple: '#d500f9', // Bright Purple
        text_highlight_pink: '#FFD700',

        // Buttons
        btn_primary_bg: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
        btn_passenger_bg: 'linear-gradient(to right, #7b1fa2 0%, #d500f9 100%)', // Purple Gradient
        btn_primary_text: '#000',

        btn_secondary_bg: '#FF416C',
        btn_secondary_text: '#fff',

        btn_driver_action_bg: '#2ecc71', // Green for main driver actions

        // Status Indicators
        status_success: '#43e97b',
        status_warning: 'rgba(255, 77, 77, 0.1)'
    }
};
