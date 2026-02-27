import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminMembers: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/app/admin/users", { replace: true });
  }, [navigate]);

  return null;
};

export default AdminMembers;
