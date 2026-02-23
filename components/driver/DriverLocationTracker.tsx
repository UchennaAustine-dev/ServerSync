"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDriverLocationTracking } from "@/lib/websocket/hooks";
import {
  Navigation,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface DriverLocationTrackerProps {
  orderId: string | null;
  isActive: boolean;
  onTrackingStart?: () => void;
  onTrackingStop?: () => void;
}

/**
 * Driver Location Tracker Component
 *
 * Automatically tracks and sends driver location updates via WebSocket
 * while a delivery is active.
 */
export function DriverLocationTracker({
  orderId,
  isActive,
  onTrackingStart,
  onTrackingStop,
}: DriverLocationTrackerProps) {
  const { isTracking, lastLocation, error, startTracking, stopTracking } =
    useDriverLocationTracking(isActive ? orderId : null);

  const [updateCount, setUpdateCount] = useState(0);

  // Track location updates
  useEffect(() => {
    if (lastLocation) {
      setUpdateCount((prev) => prev + 1);
    }
  }, [lastLocation]);

  // Notify parent component of tracking state changes
  useEffect(() => {
    if (isTracking && onTrackingStart) {
      onTrackingStart();
    } else if (!isTracking && onTrackingStop) {
      onTrackingStop();
    }
  }, [isTracking, onTrackingStart, onTrackingStop]);

  if (!isActive || !orderId) {
    return null;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isTracking
                ? "bg-green-100 text-green-600"
                : error
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            <Navigation
              className={`w-5 h-5 ${isTracking ? "animate-pulse" : ""}`}
            />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg">
              Location Tracking
            </h3>
            <p className="text-sm text-muted-foreground">
              {isTracking
                ? "Sharing your location with customer"
                : error
                  ? "Location tracking unavailable"
                  : "Location tracking inactive"}
            </p>
          </div>
        </div>

        <Badge
          variant={isTracking ? "default" : "secondary"}
          className={isTracking ? "bg-green-500" : ""}
        >
          {isTracking ? (
            <>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              Active
            </>
          ) : (
            "Inactive"
          )}
        </Badge>
      </div>

      {/* Location Info */}
      {lastLocation && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">Current Location</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Latitude:</span>{" "}
              {lastLocation.lat.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Longitude:</span>{" "}
              {lastLocation.lng.toFixed(6)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="w-3 h-3" />
            <span>
              Last updated:{" "}
              {new Date(lastLocation.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Update Stats */}
      {isTracking && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{updateCount} location updates sent</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Updates every 10 seconds
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-1">
                Location Access Error
              </p>
              <p className="text-xs text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Please enable location permissions in your browser settings to
                continue tracking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Controls */}
      <div className="flex gap-2 pt-2 border-t">
        {!isTracking && !error && (
          <Button size="sm" onClick={startTracking} className="flex-1">
            Start Tracking
          </Button>
        )}
        {isTracking && (
          <Button
            size="sm"
            variant="outline"
            onClick={stopTracking}
            className="flex-1"
          >
            Stop Tracking
          </Button>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          <strong>Note:</strong> Location tracking automatically starts when you
          accept a delivery and stops when you mark it as delivered. Your
          location is only shared with the customer during active deliveries.
        </p>
      </div>
    </Card>
  );
}
