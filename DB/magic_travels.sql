CREATE DATABASE  IF NOT EXISTS `magic_travels` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `magic_travels`;
-- MySQL dump 10.13  Distrib 8.0.20, for Win64 (x86_64)
--
-- Host: 34.65.239.231    Database: magic_travels
-- ------------------------------------------------------
-- Server version	8.0.18-google

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'd2f14559-1e05-11eb-b7d3-42010aac000c:1-206568';

--
-- Table structure for table `followed_vacations`
--

DROP TABLE IF EXISTS `followed_vacations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `followed_vacations` (
  `user_id` bigint(20) NOT NULL,
  `vacation_id` bigint(20) NOT NULL,
  KEY `user_id_idx` (`user_id`),
  KEY `vacation_id_idx` (`vacation_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `vacation_id` FOREIGN KEY (`vacation_id`) REFERENCES `vacations` (`vacation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `followed_vacations`
--

LOCK TABLES `followed_vacations` WRITE;
/*!40000 ALTER TABLE `followed_vacations` DISABLE KEYS */;
INSERT INTO `followed_vacations` VALUES (3,2),(1,1),(3,6),(1,4),(1,5),(1,2),(18,2),(18,3),(19,2),(1,28),(20,8),(20,6),(20,17),(20,28),(20,15),(20,12),(20,9),(22,11),(22,3),(22,4),(22,12),(22,5),(22,9),(22,15),(22,28),(23,4),(23,15),(24,3),(24,4),(24,11),(24,5),(24,12),(24,13),(24,15),(24,15),(24,7),(24,28),(24,6),(24,10),(25,3),(27,3),(27,6),(27,9),(27,2),(28,13),(25,11),(1,10),(26,3),(26,11),(26,5),(26,12),(26,10),(30,4),(30,3),(30,11),(30,7),(30,12),(30,6);
/*!40000 ALTER TABLE `followed_vacations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `user_name` varchar(20) NOT NULL,
  `password` varchar(60) NOT NULL,
  `user_type` varchar(20) NOT NULL DEFAULT 'Customer',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mor','Ezra','mor','766342084f4872910acc23a16dcf14c1','Customer'),(2,'Hewan','Rada','Hewan','766342084f4872910acc23a16dcf14c1','Admin'),(3,'Oogi','Fletzet','Oogf','766342084f4872910acc23a16dcf14c1','Customer'),(18,'Avi','Edri','avi','e2d2af960ada70e65297bec6a535e705','Customer'),(19,'Hadas','Rada','hadas','e2d2af960ada70e65297bec6a535e705','Customer'),(20,'magic','rubinstein','magic','e2d2af960ada70e65297bec6a535e705','Customer'),(21,'aaa','aaaa','aaaaa','43d3ae763c08f31e54f6034c5f79d308','Customer'),(22,'I love ','Yohan','Pinky','1d3c6c0e7d112899131cbc01ff040791','Customer'),(23,'Yael','N','Yael_rada','b89f05449dbb1af306306327acf41f96','Customer'),(24,'i dont','give a fck','idontgiveafck','cc545012eba5c5ec51e451706406d9b3','Customer'),(25,'Vitaliy','Drapkin','Vitaliy','c5724ea9a640e3c2fcd919dd989f0759','Customer'),(26,'Ariel@gmail.com','Cohen','Ariel','e2d2af960ada70e65297bec6a535e705','Customer'),(27,'Yuval','Hamebulbal','Yuval','9a8690712fbcea5bbb34f0911b8b8a54','Customer'),(28,'ון','ןן','Te','e2d2af960ada70e65297bec6a535e705','Customer'),(29,'lee','em','lee','e2d2af960ada70e65297bec6a535e705','Customer'),(30,'Hewan','Rada','hewanrada@gmail.com','ac5b8876de1d18f77f7ed22a4d38d012','Customer'),(31,'yohan','rada','wokiyohi@gmail.com','82f69f390a303405bd240800e6147db6','Customer');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacations`
--

DROP TABLE IF EXISTS `vacations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacations` (
  `vacation_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `image` varchar(100) NOT NULL,
  `destination` varchar(45) NOT NULL,
  `price` int(11) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`vacation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacations`
--

LOCK TABLES `vacations` WRITE;
/*!40000 ALTER TABLE `vacations` DISABLE KEYS */;
INSERT INTO `vacations` VALUES (1,'amsterdam.jpg','Amsterdam',1800,'Amsterdam is one of the greatest small cities in the world. From Amsterdam canals to world-famous Amsterdam museums and historical Amsterdam sights, it is one of the most romantic and beautiful cities in Europe. ... In this city your destination is never far away, but get a bike for an authentic local experience.','2020-08-06','2020-09-09'),(2,'madrid.jpg','Madrid',700,'Madrid has an amazing fusion of history and modern, urban lifestyle. Because Madrid is a very large city, it can be hard to get your bearings.','2020-04-04','2020-04-14'),(3,'athens.jpg','Athens',650,'Athens was the largest and most powerful Greek state. It was a city with lots of beautiful public buildings, shops and public baths. The people of Athens lived below the Acropolis (rocky hill).','2021-04-20','2021-05-02'),(4,'budapest.jpg','Budapest',800,'Budapest, with its stunning architecture, fascinating history, and rocking nightlife is located on a beautiful stretch of the Danube River. This vibrant city is home to beautiful parks, historic and grand buildings, bustling food halls, hip underground bars, and centuries-old thermal baths.','2021-10-20','2021-10-27'),(5,'cairo.jpg','Cairo',1100,'Cairo is chaos at its most magnificent, infuriating and beautiful. From above, the distorted roar of the muezzins call to prayer echoes out from duelling minarets. Below, car horns bellow tuneless symphonies amid avenues of faded 19th-century grandeur while donkey carts rattle down dusty lanes lined with colossal Fatimid and Mamluk monuments.','2021-03-07','2021-03-19'),(6,'dubai.jpg','Dubai',1800,'Indulgent, glamorous, and progressive are words that describe Dubai. This United Arab Emirates city is a luxury travel destination for leisure and business travellers. Dubai combines a modern metropolis with a timeless sensibility and Arabian flair.','2020-11-05','2020-11-26'),(7,'dublin.jpg','Dublin',400,'A small capital with a huge reputation, Dublin has a mix of heritage and hedonism that will not disappoint. All you have to do is show up.','2021-03-20','2021-03-23'),(8,'ibiza.jpg','Ibiza',730,'All-night raver, boho-cool hippy, blissed-out beach lover – Ibiza is all this and more to the many, many fans who have a soft spot for the Balearics party-hard sister. In summer the cream of the world`s DJs (David Guetta, Sven Väth, Armin van Buuren et al) descend on the island, making it the ultimate destination for clubbers. Ibiza`s modest population is swallowed whole by the seven-million-odd tourists that arrive en masse each year, and nowhere does sunset chilling or boho-glam style quite like the White Isle.','2020-08-15','2020-08-20'),(9,'london.jpg','London',1100,'London, city, capital of the United Kingdom. It is among the oldest of the world`s great cities—its history spanning nearly two millennia—and one of the most cosmopolitan. By far Britain`s largest metropolis, it is also the country`s economic, transportation, and cultural centre.','2021-10-15','2021-10-25'),(10,'istanbul.jpg','Istanbul',820,'Istanbul is Turkey`s most populous city and its cultural and financial center. Located on both sides of the Bosphorus, the narrow strait between the Black Sea and the Marmara Sea, Istanbul bridges Asia and Europe both physically and culturally.','2021-02-22','2021-03-01'),(11,'lisbon.jpg','Lisbon',640,'Lisbon is the stunning capital city of Portugal, and is one of the most charismatic and vibrant cities of Europe. It is a city that effortlessly blends traditional heritage, with striking modernism and progressive thinking.','2021-08-01','2021-08-06'),(12,'milan.jpg','Milan',990,'Milan, Italian Milano, city, capital of Milano province (provincia) and of the region (regione) of Lombardy (Lombardia), northern Italy. It is the leading financial centre and the most prosperous manufacturing and commercial city of Italy.','2020-01-01','2020-01-13'),(13,'new-delhi.jpg','New Delhi',1050,'Also the capital city of India, New Delhi is the largest commercial city in Northern India. It counts 250.000 inhabitants (within the district of Delhi, where live 16.3 milions inhabitants), who speak Hindi for the most part.','2022-07-17','2022-08-04'),(15,'rome.jpg','Rome',570,'the Eternal City, is the capital and largest city of Italy and of the Lazio region. It is famous for being the home of the ancient Roman Empire, the Seven Hills, La Dolce Vita (the sweet life), the Vatican City and Three Coins in the Fountain.','2022-02-25','2022-03-05'),(17,'tokyo.jpg','Tokyo',1450,'Japan`s capital and the world`s most populous metropolis. It is also one of Japan`s 47 prefectures, consisting of 23 central city wards and multiple cities, towns and villages west of the city center. The Izu and Ogasawara Islands are also part of Tokyo. Prior to 1868, Tokyo was known as Edo.','2022-01-15','2022-02-05'),(18,'vienna.jpg','Vienna',890,'Vienna, also described as Europe`s cultural capital, is a metropolis with unique charm, vibrancy and flair. It boasts outstanding infrastructure, is clean and safe, and has all the inspiration that you could wish for in order to discover this wonderful part of Europe.','2022-05-23','2022-05-28'),(28,'paris.jpg','Paris',940,'Paris (nicknamed the \"City of light\") is the capital city of France, and the largest city in France. The area is 105 square kilometres (41 square miles), and around 2.15 million people live there. If suburbs are counted, the population of the Paris area rises to 12 million people.\n','2022-10-07','2022-10-12');
/*!40000 ALTER TABLE `vacations` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-15 19:56:59
