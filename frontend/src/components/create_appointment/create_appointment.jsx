import { useState, useEffect } from "react";
import { Calendar, Stethoscope, Wifi, WifiOff, Search, CheckCircle, XCircle, Clock, CalendarIcon } from "lucide-react";
import { Badge } from "./components/ui/badge";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Calendar as CalendarComponent } from "./components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { toast, Toaster } from "sonner@2.0.3";
import { format } from "date-fns";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { getAvailableSlots, reserveSlot, confirmReservation, cancelReservation } from '../../services/api';

// Types
/**
 * @typedef {Object} TimeSlot
 * @property {string} id
 * @property {string} time
 * @property {boolean} isAvailable
 * @property {boolean} isReservedByUser
 */

// Header Component
function Header() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-500 rounded-full">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">
            Doctor Appointment Booking
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Reserve your preferred time slot easily and quickly with our streamlined booking system
        </p>
        <div className="mt-8 flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1659019479789-4dd5dbdc2cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBzdGV0aG9zY29wZSUyMG1lZGljYWx8ZW58MXx8fHwxNzU4NzE1MDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Medical professional"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// WebSocket Status Component
function WebSocketStatus({ isConnected }) {
  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="flex items-center gap-1 transition-all duration-200"
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          Connected
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Disconnected
        </>
      )}
    </Badge>
  );
}

// Booking Form Component
function BookingForm({
  doctorId,
  setDoctorId,
  userId,
  setUserId,
  selectedDate,
  setSelectedDate,
  onLoadSlots,
  isLoading,
  isConnected
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <Card className="p-6 shadow-lg border-0 bg-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Book Appointment</h2>
          <WebSocketStatus isConnected={isConnected} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="doctorId" className="text-gray-700">Doctor ID</Label>
            <Input
              id="doctorId"
              type="number"
              placeholder="Enter doctor ID"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId" className="text-gray-700">User ID</Label>
            <Input
              id="userId"
              type="number"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Appointment Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left transition-all duration-200 hover:bg-gray-50 bg-gray-50 hover:border-blue-300"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={onLoadSlots}
          disabled={!doctorId || !selectedDate || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
        >
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : "Load Available Slots"}
        </Button>
      </div>
    </Card>
  );
}

// Time Slots Component
function TimeSlots({
  slots,
  selectedSlot,
  onSlotSelect,
  onReserveSlot,
  onConfirmReservation,
  onCancelReservation,
  isLoading
}) {
  if (slots.length === 0) {
    return (
      <Card className="p-8 text-center bg-gray-50 border-dashed">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No slots loaded</h3>
        <p className="text-gray-500">Please select a doctor and date to view available slots</p>
      </Card>
    );
  }

  const selectedSlotData = slots.find(slot => slot.id === selectedSlot);
  const reservedByUserSlot = slots.find(slot => slot.isReservedByUser);

  return (
    <Card className="p-6 shadow-lg border-0 bg-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Available Time Slots</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full border"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Selected</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            const isReserved = !slot.isAvailable && !slot.isReservedByUser;
            const isReservedByUser = slot.isReservedByUser;
            
            return (
              <Button
                key={slot.id}
                variant="outline"
                disabled={isReserved || isLoading}
                onClick={() => onSlotSelect(slot.id)}
                className={`
                  h-12 transition-all duration-200 transform hover:scale-105 active:scale-95
                  ${isSelected ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : ''}
                  ${isReserved ? 'bg-red-500 text-white border-red-500 cursor-not-allowed opacity-75' : ''}
                  ${isReservedByUser ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : ''}
                  ${!isSelected && !isReserved && !isReservedByUser ? 'bg-gray-50 hover:bg-gray-100 border-gray-200' : ''}
                `}
              >
                {slot.time}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button
            onClick={onReserveSlot}
            disabled={!selectedSlot || isLoading || selectedSlotData?.isReservedByUser}
            className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Reserve Selected Slot
          </Button>

          <Button
            onClick={onConfirmReservation}
            disabled={!reservedByUserSlot || isLoading}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Reservation
          </Button>

          <Button
            onClick={onCancelReservation}
            disabled={!reservedByUserSlot || isLoading}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Reservation
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  slotTime,
  onConfirm,
  onCancel,
  action
}) {
  const getActionText = () => {
    switch (action) {
      case 'reserve':
        return {
          title: 'Reserve Time Slot',
          description: `Do you want to reserve the ${slotTime} time slot?`,
          confirmText: 'Reserve',
          confirmIcon: <Clock className="mr-2 h-4 w-4" />,
          confirmClass: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'confirm':
        return {
          title: 'Confirm Reservation',
          description: `Please confirm your reservation for ${slotTime}. This action cannot be undone.`,
          confirmText: 'Confirm',
          confirmIcon: <CheckCircle className="mr-2 h-4 w-4" />,
          confirmClass: 'bg-green-500 hover:bg-green-600'
        };
      case 'cancel':
        return {
          title: 'Cancel Reservation',
          description: `Are you sure you want to cancel your reservation for ${slotTime}?`,
          confirmText: 'Cancel Reservation',
          confirmIcon: <XCircle className="mr-2 h-4 w-4" />,
          confirmClass: 'bg-red-500 hover:bg-red-600'
        };
    }
  };

  const actionData = getActionText();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actionData.confirmIcon}
            {actionData.title}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {actionData.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="transition-all duration-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={`${actionData.confirmClass} transition-all duration-200 transform hover:scale-105`}
          >
            {actionData.confirmIcon}
            {actionData.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Mock WebSocket connection hook
const useMockWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate connection after 1 second
    const timer = setTimeout(() => {
      setIsConnected(true);
      toast.success("Connected to booking system");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { isConnected };
};

// Mock time slots data generator
const generateMockSlots = () => {
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        id: `${hour}-${minute}`,
        time,
        isAvailable: Math.random() > 0.3, // 70% chance of being available
        isReservedByUser: false
      });
    }
  }
  
  return slots;
};

// Main App Component
export default function App() {
  const [doctorId, setDoctorId] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("reserve");

  const { isConnected } = useMockWebSocket();

  const handleLoadSlots = async () => {
    if (!doctorId || !selectedDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    toast.loading("Loading available slots...");

    try {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const response = await getAvailableSlots(doctorId, formattedDate);

    setSlots(response.data.slots); // adjust based on backend response
    setSelectedSlot(null);
        toast.success(`Found ${response.data.slots.length} slots`);
    } catch (err) {
        toast.error("Failed to load slots");
    } finally {
        setIsLoading(false);
        toast.dismiss();
    }
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlot(selectedSlot === slotId ? null : slotId);
  };

  const handleReserveSlot = () => {
    if (!selectedSlot) return;
    setModalAction('reserve');
    setModalOpen(true);
  };

  const handleConfirmReservation = () => {
    setModalAction('confirm');
    setModalOpen(true);
  };

  const handleCancelReservation = () => {
    setModalAction('cancel');
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    try {
          if (modalAction === "reserve" && selectedSlot) {
              await reserveSlot(userId, selectedSlot);
              toast.success("Slot reserved successfully!");
          }
      else if (modalAction === "confirm") {
          const reserved = slots.find(slot => slot.isReservedByUser);
          await confirmReservation(userId, reserved.id);
          toast.success("Reservation confirmed!");
      }
      else if (modalAction === "cancel") {
          const reserved = slots.find(slot => slot.isReservedByUser);
          await cancelReservation(userId, reserved.id);
          toast.success("Reservation cancelled!");
      }
      handleLoadSlots(); // refresh slots
    }catch (err) {
      toast.error("Action failed");
    } finally {
      setModalOpen(false);
    }
};


  const selectedSlotData = slots.find(slot => slot.id === selectedSlot);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <BookingForm
          doctorId={doctorId}
          setDoctorId={setDoctorId}
          userId={userId}
          setUserId={setUserId}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onLoadSlots={handleLoadSlots}
          isLoading={isLoading}
          isConnected={isConnected}
        />

        <TimeSlots
          slots={slots}
          selectedSlot={selectedSlot}
          onSlotSelect={handleSlotSelect}
          onReserveSlot={handleReserveSlot}
          onConfirmReservation={handleConfirmReservation}
          onCancelReservation={handleCancelReservation}
          isLoading={isLoading}
        />
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        slotTime={selectedSlotData?.time || slots.find(slot => slot.isReservedByUser)?.time || null}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
        action={modalAction}
      />

      <Toaster 
        position="top-right" 
        richColors 
        expand 
        closeButton 
      />
    </div>
  );
}