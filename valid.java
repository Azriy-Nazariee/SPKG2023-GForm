public class valid {
    public static void main(String[] args) {
        // Check if email has been sent to the student or not
        if (!emailSent() || (emailSent() && checkStatus().equals("not accepted"))) {
            checkSlot();
            // Check if AM slot and PM slot are the same
            if (checkSlot().equals("am") && !checkSlot().equals("pm")) {
                checkCapacity();
                // Check if the capacity is full or not
                if (checkCapacity().equals("full")) {
                    System.out.println("Sorry, the capacity of this slot is full");
                } else {
                    System.out.println("Registration successful");
                }
            } else {
                System.out.println("Selection Error : Both session selections cannot be the same");
            }
        } else if (checkStatus().equals("accepted")) {
            System.out.println("Status Error : You have already registered your sessions.");
        }
    }

    public static boolean emailSent() {
        // Check if the email has been sent
        // Add your implementation here
        return false; // Placeholder return value
    }

    public static String checkStatus() {
        // Check the status of the email
        // Add your implementation here
        return "not accepted"; // Placeholder return value
    }

    public static String checkSlot() {
        // Check the slot chosen by the students
        // Add your implementation here
        return "am"; // Placeholder return value
    }

    public static String checkCapacity() {
        // Check the capacity of the slot
        // Add your implementation here
        return "full"; // Placeholder return value
    }
}
