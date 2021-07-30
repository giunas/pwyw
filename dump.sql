-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: localhost    Database: Progetto
-- ------------------------------------------------------
-- Server version	8.0.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `abbonamento`
--

DROP TABLE IF EXISTS `abbonamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `abbonamento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `emailsend` varchar(100) DEFAULT NULL,
  `piva` varchar(11) DEFAULT NULL,
  `dataavvio` date DEFAULT NULL,
  `periodicita` int(11) DEFAULT NULL,
  `numeropagamenti` int(11) DEFAULT NULL,
  `importo` double DEFAULT NULL,
  `paytype` varchar(27) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `piva` (`piva`),
  KEY `emailsend` (`emailsend`,`paytype`),
  CONSTRAINT `abbonamento_ibfk_1` FOREIGN KEY (`emailsend`) REFERENCES `account` (`email`),
  CONSTRAINT `abbonamento_ibfk_2` FOREIGN KEY (`piva`) REFERENCES `esercizicomm` (`piva`),
  CONSTRAINT `abbonamento_ibfk_3` FOREIGN KEY (`emailsend`, `paytype`) REFERENCES `paytypes` (`email`, `codice`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abbonamento`
--

LOCK TABLES `abbonamento` WRITE;
/*!40000 ALTER TABLE `abbonamento` DISABLE KEYS */;
/*!40000 ALTER TABLE `abbonamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `account` (
  `cf` varchar(16) NOT NULL,
  `nome` varchar(20) DEFAULT NULL,
  `cognome` varchar(20) DEFAULT NULL,
  `gender` varchar(1) DEFAULT NULL,
  `ddn` date DEFAULT NULL,
  `ln` varchar(20) DEFAULT NULL,
  `residenza` varchar(20) DEFAULT NULL,
  `indirizzo` varchar(20) DEFAULT NULL,
  `telefono` varchar(13) DEFAULT NULL,
  `email` varchar(40) NOT NULL,
  `password` varchar(32) DEFAULT NULL,
  `importo` double DEFAULT NULL,
  `session_id` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`email`),
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('PRRRRT68A01G273R','Roberto','Pirrone','M','1968-01-01','Palermo','Palermo','Via Roma, 6','3334456712','roberto@pirrone.it','557cc33de329850233c0774b89df28c7',0,NULL);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `cards` (
  `codice` varchar(27) NOT NULL,
  `tipocarta` varchar(20) DEFAULT NULL,
  `scadenza` varchar(7) DEFAULT NULL,
  `codicesicurezza` int(11) DEFAULT NULL,
  `saldo` double DEFAULT NULL,
  PRIMARY KEY (`codice`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cards`
--

LOCK TABLES `cards` WRITE;
/*!40000 ALTER TABLE `cards` DISABLE KEYS */;
INSERT INTO `cards` VALUES ('5333123476538890','VISA','05/2020',234,0),('5333123476538891','VISA','05/2020',234,45),('IT12T1234512345123456789012','IBAN',NULL,NULL,498);
/*!40000 ALTER TABLE `cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `esercizicomm`
--

DROP TABLE IF EXISTS `esercizicomm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `esercizicomm` (
  `piva` varchar(11) NOT NULL,
  `nome` varchar(20) DEFAULT NULL,
  `email` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`piva`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `esercizicomm`
--

LOCK TABLES `esercizicomm` WRITE;
/*!40000 ALTER TABLE `esercizicomm` DISABLE KEYS */;
INSERT INTO `esercizicomm` VALUES ('ABCDEFGH','SPOTIFY','spo@ty.it');
/*!40000 ALTER TABLE `esercizicomm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paytypes`
--

DROP TABLE IF EXISTS `paytypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `paytypes` (
  `email` varchar(32) NOT NULL,
  `codice` varchar(27) NOT NULL,
  PRIMARY KEY (`email`,`codice`),
  CONSTRAINT `paytypes_ibfk_1` FOREIGN KEY (`email`) REFERENCES `account` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paytypes`
--

LOCK TABLES `paytypes` WRITE;
/*!40000 ALTER TABLE `paytypes` DISABLE KEYS */;
/*!40000 ALTER TABLE `paytypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reghash`
--

DROP TABLE IF EXISTS `reghash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `reghash` (
  `hash` varchar(32) NOT NULL,
  `importo` double DEFAULT NULL,
  `provenienza` varchar(45) DEFAULT NULL,
  `emaildest` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reghash`
--

LOCK TABLES `reghash` WRITE;
/*!40000 ALTER TABLE `reghash` DISABLE KEYS */;
/*!40000 ALTER TABLE `reghash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertrans`
--

DROP TABLE IF EXISTS `usertrans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `usertrans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `emailsend` varchar(32) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `emailrecv` varchar(32) DEFAULT NULL,
  `importo` double DEFAULT NULL,
  `tipo` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `emailsend` (`emailsend`),
  CONSTRAINT `usertrans_ibfk_1` FOREIGN KEY (`emailsend`) REFERENCES `account` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertrans`
--

LOCK TABLES `usertrans` WRITE;
/*!40000 ALTER TABLE `usertrans` DISABLE KEYS */;
/*!40000 ALTER TABLE `usertrans` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-09-10 23:58:00
