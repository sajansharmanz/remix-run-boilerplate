import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface IProps {
  title: string;
  description: string;
  mainContent: React.ReactNode;
  footerContent?: React.ReactNode;
}

const AuthCard: React.FC<IProps> = ({
  title,
  description,
  mainContent,
  footerContent,
}) => {
  return (
    <Card className="w-[360px]">
      <CardHeader className="pb-[10px]">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>{mainContent}</CardContent>
      {footerContent ? (
        <CardFooter className="justify-center">{footerContent}</CardFooter>
      ) : null}
    </Card>
  );
};

AuthCard.displayName = "Components:AuthCard";

export default AuthCard;
